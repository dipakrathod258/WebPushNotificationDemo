@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">Dashboard</div>

                <div class="card-body">
                    @if (session('status'))
                        <div class="alert alert-success" role="alert">
                            {{ session('status') }}
                        </div>
                    @endif

                    You are logged in!
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <button class="btn btn-info" id="enbale_notification_btn">Enable Notification</button>
    </div>
    <div class="row">
        <form id="notify_form">
          <div class="form-group">
            <label for="email">Title</label>
            <input type="text" class="form-control" id="email" name="title">
          </div>
          <div class="form-group">
            <label for="pwd">Body:</label>
            <input type="text" class="form-control" id="pwd" name="body">
          </div>
          <button type="submit" class="btn btn-default">Submit</button>
        </form>        
    </div>
</div>
<script type="text/javascript">
    $(function(){
         $("#enbale_notification_btn").on("click", function() {



        var _registration = null;
        function registerServiceWorker() {
          return navigator.serviceWorker.register('{{ url("/js/app_service_worker/service-worker.js") }}')
          .then(function(registration) {
            console.log('Service worker successfully registered.');
            _registration = registration;
            return registration;
          })
          .catch(function(err) {
            console.error('Unable to register service worker.', err);
          });
        }

        function askPermission() {
          return new Promise(function(resolve, reject) {
            const permissionResult = Notification.requestPermission(function(result) {
              resolve(result);
            });

            if (permissionResult) {
              permissionResult.then(resolve, reject);
            }
          })
          .then(function(permissionResult) {
            if (permissionResult !== 'granted') {
              throw new Error('We weren\'t granted permission.');
            }
            else{
              subscribeUserToPush();
            }
          });
        }

        function urlBase64ToUint8Array(base64String) {
          const padding = '='.repeat((4 - base64String.length % 4) % 4);
          const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

          const rawData = window.atob(base64);
          const outputArray = new Uint8Array(rawData.length);

          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
          }
          return outputArray;
        }

        function getSWRegistration(){
          var promise = new Promise(function(resolve, reject) {
          // do a thing, possibly async, then…

          if (_registration != null) {
            resolve(_registration);
          }
          else {
            reject(Error("It broke"));
          }
          });
          return promise;
        }

        function subscribeUserToPush() {
          getSWRegistration()
          .then(function(registration) {
            console.log(registration);
            const subscribeOptions = {
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(
                "BCq8m4xAkhYjDUtAePZygIoeqMmDosiaLVlhpYh8lB6YfR_EA6uZMAdqOAlETrf39rl0iT-OpsITt8zbXrxLroc"
              )
            };
            // alert("aya")
            return registration.pushManager.subscribe(subscribeOptions);
          })
          .then(function(pushSubscription) {
            console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
            sendSubscriptionToBackEnd(pushSubscription);
            return pushSubscription;
          });
        }

        function sendSubscriptionToBackEnd(subscription) {
          return fetch('/api/save-subscription/{{Auth::user()->id}}', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscription)
          })
          .then(function(response) {
            if (!response.ok) {
              throw new Error('Bad status code from server.');
            }

            return response.json();
          })
          .then(function(responseData) {
            console.log("this is response data")
            console.log(responseData)
            if (!(responseData.data && responseData.data.success)) {
              throw new Error('Bad response from server.');
            }
          });
        }


        function enableNotifications(){
          //register service worker
          //check permission for notification/ask
          askPermission();
        }
        registerServiceWorker();
        })


         $("#notify_form").on("submit", function(e) {
            e.preventDefault()

            title = $("#title").val()
            body = $("#body").val()

        
            $.ajax({
              url: "{{url('/api/send-notification/'.auth()->user()->id)}}",
              headers:{
                 'X-CSRF-TOKEN': "{{ csrf_token() }}"
               },   
              method: 'POST',
              type: 'JSON',
              data:  {'title': title, 'body': body},
              contentType: false,
              cache: false,
              processData:false,
              success: function(obj) {
                // console.log(obj);
                alert("success")
  
              },
              error: function(obj) {
                alert("error")
              }
            })


         })

        //     function sendNotification(){
        //       var data = new FormData();
        //     data.append('title', document.getElementById('title').value);
        //     data.append('body', document.getElementById('body').value);

        //     var xhr = new XMLHttpRequest();
        //     xhr.open('POST', "{{url('/api/send-notification/'.auth()->user()->id)}}", true);
        //     xhr.onload = function () {
        //         // do something to response
        //         console.log(this.responseText);
        //     };
        //     xhr.send(data);
        // }
    })
</script>
@endsection

