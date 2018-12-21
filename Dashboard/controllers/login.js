$(document).ready(function () {
  
  
    function ajaxCallsFunc(type, url, contentType, data, callback) {
      $.ajax({
        type: type,
        url: url,
        contentType: contentType,
        data: data,
        success: callback
      });
    }
    
    

    $("#btn_login").click(function () {
        
        $user = $("#user").val()
        $pass = $("#password").val()
        var dummydata3 = JSON.stringify({
            "user":$user,
            "pass": $pass
        });
    
    
        ajaxCallsFunc('POST', "http://127.0.0.1:5000/auth", 'application/json', dummydata3, function (branches) {  
            console.log(branches)
                if(branches = true){
                    window.location.replace('newLanguage.html')
                }
            });
        }
    )
    
  
  });