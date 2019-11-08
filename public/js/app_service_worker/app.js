// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


(function() {
  'use strict';

	var app = {
    	isLoading: true,
    	db: null,
    	baseURL : "http://localhost:8001/firebase",
    	promiseSuccess: false,
    	spinner: document.querySelector('.loader'),
    	addDialog: document.querySelector('.dialog-container')
  	};

	// TODO add service worker code here
  	if ('serviceWorker' in navigator) {
    	navigator.serviceWorker
             .register('service-worker.js')
             .then(initialiseState);



        // Listen to messages from service workers.
    	navigator.serviceWorker.addEventListener('message', function(event) {
    		 window.parent.showReminder(event.data);
    		console.log(event.data);
    	});
  	}
	
	/********Demo 5 Adding Push notifications*******/
	
	function initialiseState() {

	  	// Are Notifications supported in the service worker?  
	  	if (!('showNotification' in ServiceWorkerRegistration.prototype)) {  
			alert('Notifications aren\'t supported.');  
			return;  
		}

		//Push notifications are supported. Now lets register for push notifications.
		//First check if user is already subscribed.
		navigator.serviceWorker.ready
	      .then(function (registration) {
	        registration.pushManager.getSubscription()
	        .then(function (subscription) {
	          if (subscription) {
	          	rawKey = "BAEomHexBuY2fjTdHUrw1A3ssnHBO5GEgzSsXIZaygg9nk4mW2aYysoxUVehlDk-K7F_JZbMFw_YfoKZ9Ty_Tuw";
	          	var rawKey = subscription.getKey ? subscription.getKey('p256dh') : '';
                var key = rawKey ? Base64EncodeUrl(btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey)))) : '';
                var rawAuthSecret = subscription.getKey ? subscription.getKey('auth') : '';
                var authSecret = rawAuthSecret ? Base64EncodeUrl(btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuthSecret)))) : '';             
                console.log("Key: " + key);
                console.log("AuthSecret: " + authSecret);
                console.log('endpoint:', subscription.endpoint);
	          	//just in case if registration id is not saved on server.
	            saveSubscriptionID(subscription, key, authSecret,subscription.endpoint);
	          }
	          else {
	          	subscribeForNotifications();
	          }
	        })
	        .catch(function (error) {
	          console.error('Error occurred while enabling push ', error);
	        });
	    });
	}
	
	function Base64EncodeUrl(str){
		return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
	}

	function Base64DecodeUrl(str){
		str = (str + '===').slice(0, str.length + (str.length % 4));
		return str.replace(/-/g, '+').replace(/_/g, '/');
	}

	function subscribeForNotifications(){
		navigator.serviceWorker.ready.then(function(registration) {
	      if (!registration.pushManager) {
	        alert('Your browser doesn\'t support push notification.');
	        return false;
	      }
	      // console.log("Registration dfsdf")
	      // console.log(registration)
	      //To subscribe `push notification` from push manager
	      registration.pushManager.subscribe({
	        userVisibleOnly: true, //Always show notification when received
	          applicationServerKey: "BCq8m4xAkhYjDUtAePZygIoeqMmDosiaLVlhpYh8lB6YfR_EA6uZMAdqOAlETrf39rl0iT-OpsITt8zbXrxLroc"

	      })
	      .then(function (subscription) {
	        var rawKey = subscription.getKey ? subscription.getKey('p256dh') : '';
			var key = rawKey ? Base64EncodeUrl(btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey)))) : '';
			var rawAuthSecret = subscription.getKey ? subscription.getKey('auth') : '';
			var authSecret = rawAuthSecret ? Base64EncodeUrl(btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuthSecret)))) : '';             
			console.log("Key: " + key);
			console.log("AuthSecret: " + authSecret);
			console.log('endpoint:', subscription.endpoint);
			// just in case if registration id is not saved on server.
			saveSubscriptionID(subscription, key, authSecret,subscription.endpoint);
	        // console.log(subscription);
	      })
	      .catch(function (error) {
	      	alert('Oops, you have disabled push notificaitons. I will not be able to give you real time updates.')
	      });
	    });
	}

	function saveSubscriptionID(subscription, key, authSecret,endpoint) {

	    	$.ajax({
				type: "POST",
				url: "http://127.0.0.1:8001/register_credentials",
				// The key needs to match your method's input parameter (case-sensitive).
				headers: {
      'X-CSRF-Token': $('meta[name="_token"]').attr('content')
    },
				data: {
					userId : 1,
					key: key,
					authSecret: authSecret,
					endpoint: endpoint,
					access_token: '9be98b6336b6c0cf9e5e07214f223dd6'
				},
				crossDomain: true,
				cache: false,
				contentType: "application/x-www-form-urlencoded",
				success: function(data){
					
				},
				failure: function(errMsg) {
					alert(errMsg);
				}
			});
	    	return;	   	  
	}	
})();
