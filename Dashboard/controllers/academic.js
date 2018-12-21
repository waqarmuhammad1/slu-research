$(document).ready(function () {
    $('.tooltipped').tooltip();

    // window.onload = function(){

    //     ajaxCallsFunc('POST', "http://127.0.0.1:5000/get_user", 'application/json', null, function (branches) {
            
    //         localStorage.setItem("user",branches);
    //     });

    // };

    function ajaxCallsFunc(type, url, contentType, data, callback) {
        $.ajax({
          type: type,
          url: url,
          contentType: contentType,
          data: data,
          success: callback
        });
      }

    $lang_name = $("#lang_name")
    $lang_symbol = $("#lang_symbol")
    $dic_txt = $("#dic")
    $aff_txt = $("#aff")
    var numb = 2

    $("#btn_add").click(function(){
        $root = $("#col112")
        var a = "<li id = \"custom_li_"+numb.toString()+"\">\
        <div class=\"collapsible-header\"><i class=\"material-icons\">add_circle</i>Add Root Word "+numb.toString()+"</div>\
        <div class=\"collapsible-body\">\
            <div class=\"row\" id=\"root_fields\">\
                <div class=\"input-field col s2\" style=\"left:30px\">\
                    <input value=\"\" id=\"custom_root_"+numb.toString()+"\" type=\"text\"\>\
                    <label class= for=\"custom_root_"+numb.toString()+"\">Root Word</label>\
                </div>\
                <form class=\"col s11\">\
                    <div class=\"row\">\
                        <div class=\"input-field\" style=\"left:40px;\">\
                            <textarea id=\"custom_txt_area_"+numb.toString()+"\" class=\"materialize-textarea\"></textarea>\
                            <label for=\"custom_txt_area_"+numb.toString()+"\">Dictionary</label>\
                        </div>\
                    </div>\
                </form>\
            </div>\
        </div>\
    </li>";
        

        $root.append(a);
        numb = numb + 1;
        console.log(numb);
    });

    $("#okbtn").click(function(){

        console.log("i m here")
        $("#modal1").closeModal();

    });
    $("#drawGraph").click(function(){

        console.log(localStorage.getItem("user"))
        var data = [];
        var meta = {

            "user":localStorage.getItem("user"),
            "lang_name" : $("#lang_name").val(),
            "lang_symbol" : $("#lang_symbol").val()
        }

        for (var i = 1; i< numb; i++){
            var a = "custom_root_"+i;
            console.log(a);
            var root_word = $("#custom_root_"+i.toString()).val();
            var root_word_data = $("#custom_txt_area_"+i.toString()).val();
            console.log(root_word)
            data.push({
                "root_word" : root_word,
                "root_data" : root_word_data
            });
            // data[root_word] = root_word_data;
        }

        data2 = {"meta": meta, "data":data}

        console.log(data);
        dummyData = JSON.stringify(data2);
        
        ajaxCallsFunc('POST', "http://127.0.0.1:5000/save_data", 'application/json', dummyData, function (branches) {

            window.location.reload();
            
        });


    });
    
    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };
    
    $('select').material_select();
});