(function() {

  return {
    resources: {
      DOMAIN_PATTERN: /[a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+/,
      DATE_FORMAT: 'MMMM Do YYYY'
    },

    events: {
      'app.activated': 'showCustomer',
      'click .action': 'handleClick',
      'click .toggle-reveal-hide': 'handleRevealHide'
    },

    requests: {
      fetchCustomer: function (customerId) {
        return {
          url: 'https://app.promoter.io/api/contacts/'+customerId,
          type:'GET',
          headers: {
            Authorization: 'Token '+this.settings.api_key
          },
          dataType: 'json'
        };
      },
      fetchCustomerFeedbackByEmail: function (email) {
        return {
          url: 'https://app.promoter.io/api/feedback/?survey__contact__email='+email,
          type:'GET',
          headers: {
            Authorization: 'Token '+this.settings.api_key
          },
          dataType: 'json'
        };
      },
      fetchCustomersByEmail: function (email) {
        return {
          url: 'https://app.promoter.io/api/contacts/?email='+email,
          type:'GET',
          headers: {
            Authorization: 'Token '+this.settings.api_key
          },
          dataType: 'json'
        };
      }
    },

    buildCustomerFromPromoterCustomer: function (promoterCustomer) {
      promoterCustomer.full_name = [promoterCustomer.first_name, promoterCustomer.last_name].join(' ').trim();
      promoterCustomer.formatted_unsubscribed = (promoterCustomer.unsubscribed ? 'true' : 'false');
      promoterCustomer.formatted_created_date = this.formatDateString(promoterCustomer.created_date);
      return promoterCustomer;
    },

    buildFeedbackFromPromoterFeedback: function (promoterFeedback) {
      if (promoterFeedback.contact) {
        promoterFeedback.contact = this.buildCustomerFromPromoterCustomer(promoterFeedback.contact);
      }
      promoterFeedback.formatted_posted_date = this.formatDateString(promoterFeedback.posted_date);
      promoterFeedback.formated_comment_updated_date = this.formatDateString(promoterFeedback.comment_updated_date);
      switch (promoterFeedback.score_type) {
        case 'detractor': promoterFeedback.score_class = 'important'; break;
        case 'passive': promoterFeedback.score_class = 'warning'; break;
        case 'promoter': promoterFeedback.score_class = 'success'; break;
      }
      return promoterFeedback;
    },

    cache: function (key, data) {
      this.store(key, data);
    },

    cachePromoterCustomerSearch: function (promoterCustomers) {
      var customerIds = [];
      if (promoterCustomers.results && promoterCustomers.results.length) {
        for (var i = promoterCustomers.results.length - 1; i >= 0; i--) {
          var customer = this.buildCustomerFromPromoterCustomer(promoterCustomers.results[i]);
          customerIds.push(customer.id);
        }
        this.cache('customerIds', customerIds);
      }
    },

    cacheClear: function (key) {

    },

    cacheFetch: function (key, default_value) {
      default_value = default_value || null;
      try {
        var value = this.store(key);
        return value ? value : default_value;
      } catch (error) {
        return default_value;
      }
    },

    clone: function(obj) {
      if (null == obj || "object" != typeof obj) {
        return obj;
      }
      var copy = obj.constructor();
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
      }
      return copy;
    },

    formatDateString: function (date_string, format) {
      format = format || this.resources.DATE_FORMAT;
      return moment(date_string).format(format);
    },

    formatMoney: function (number) {
      return '$' + parseFloat(Math.round(number * 100) / 100).toFixed(2);
    },

    getCustomerEmail: function () {
        if (this.currentLocation() === 'ticket_sidebar') {
            return this.ticket().requester().email();
        } else if (this.currentLocation() === 'user_sidebar') {
            return this.user().email();
        }
        return;
    },

    getDomainFromURL: function(baseURI) {
      var regexResult = this.resources.DOMAIN_PATTERN.exec(baseURI);
      return regexResult[0];
    },

    handleClick: function (e, data) {
      e.preventDefault();
      var link = this.$(e.target);
      switch (true) {
        case link.is('.show-customer'):
          this.showCustomer(e, link.data());
          break;
        case link.is('.show-search'):
          this.showSearch(e, link.data());
          break;
        case link.is('.show-settings'):
          this.showAppSettings(e, link.data());
          break;
      }
    },

    handleRevealHide: function (e, data) {
      e.preventDefault();
      var link = this.$(e.target);
      var panel = link.closest('.reveal-hide');
      if (panel) {
        if (panel.is('.not-visible')) {
          panel.find('.panel-body').slideDown(500, function () {
            panel.removeClass('not-visible').addClass('visible');
          });
        } else {
          panel.find('.panel-body').slideUp(500, function () {
            panel.removeClass('visible').addClass('not-visible');
          });
        }
      }
    },

    showAppSettings: function(e, data) {
      var approvedSettings = this.clone(this.settings);
      if (approvedSettings.api_key) {
        var original = approvedSettings.api_key;
        var masked = original.substring(3, original.length);
        approvedSettings.api_key = original.replace(masked, Array(masked.length).join('x'));
      }
      var pageData = {
        title: this.I18n.t('settingsPage.title'),
        settings: approvedSettings,
        email: this.currentUser().email(),
        uri: this.getDomainFromURL(e.currentTarget.baseURI),
        installation_id: this.installationId()
      };
      this.switchTo('settingsPage', pageData);
    },

    showCustomer: function(e, data) {
      if (this.verifyConfiguration(e, data)) {
        var app = this;
        var pageData = {
          title: app.I18n.t('customerPage.title'),
          average_score: null,
          feedbacks: []
        };
        var scores = [];
        app.switchTo('loading');
        app.ajax('fetchCustomerFeedbackByEmail', app.getCustomerEmail())
          .done(function (data) {
            var results = data.results;
            if (results && results.length) {
              for (var i = results.length - 1; i >= 0; i--) {
                var feedback = app.buildFeedbackFromPromoterFeedback(results[i]);
                pageData.feedbacks.push(feedback);
                scores.push(feedback.score);
              }
            } else {
              pageData.error_message = 'No feedback available for '+app.getCustomerEmail();
            }
            if (scores.length) {
              var sum = 0;
              for ( var j = 0; j < scores.length; j++ ) {
                  sum += parseInt( scores[j], 10 );
              }
              var avg = sum/scores.length;
              pageData.average_score = avg + '';
            }
            app.switchTo('customerPage', pageData);
          });
      }
    },

    verifyConfiguration: function (e, data) {
      if (this.settings.api_key) {
        return true;
      }
      this.showAppSettings(e, data);
      return false;
    }
  };

}());
