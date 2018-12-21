$(document).ready(function () {
  $selector = $("#select1")
  $('.tabs').tabs();
  // $('.collapsible').collapsible();

  function ajaxCallsFunc(type, url, contentType, data, callback) {
    $.ajax({
      type: type,
      url: url,
      contentType: contentType,
      data: data,
      success: callback
    });
  }
  // $("#divReadOnlyFields :input").attr("disabled", true);

  window.onload = function () {

    ajaxCallsFunc('POST', "http://127.0.0.1:5000/retrieve_langs", 'application/json', null, function (branches) {
      console.log(branches)
      for (var val in branches) {
        $selector.append($("<option>" + branches[val] + "</option>"));
        $selector.trigger('contentChanged');
      }
    });


  };


  $('select').on('contentChanged', function () {
    $(this).material_select();
  });




  $dict = $("#textarea1")
  $affix = $("#textarea2")
  var numb = 0;
  $("#drawgraph").click(function () {

    if ($("#select1").val() == String.empty)
      return;
    var dummydata3 = JSON.stringify({
      "lang": $("#select1").val()
    });


    ajaxCallsFunc('POST', "http://127.0.0.1:5000/retrieve_data", 'application/json', dummydata3, function (branches) {


      var language = branches[0];
      var lang_symb = branches[1];


      $root = $("#root");
      $root.empty();

      for (var word in language) {
        var a = "<li id = \"custom_li_" + numb.toString() + "\">\
          <div class=\"collapsible-header\">Root Word: "+ word + "</div>\
          <div class=\"collapsible-body\">\
              <div class=\"row\" id=\"root_fields\">\
                  <div class=\"input-field col s2\" style=\"left:30px\">\
                      <input value=\""+ word + "\" id=\"custom_root_" + numb.toString() + "\" type=\"text\"\>\
                      <label class=\"active\" for=\"custom_root_"+ numb.toString() + "\">Root Word</label>\
                  </div>\
                  <form class=\"col s11\">\
                      <div class=\"row\">\
                          <div class=\"input-field\" style=\"left:40px;\">\
                              <textarea id=\"custom_txt_area_"+ numb.toString() + "\" class=\"materialize-textarea\"></textarea>\
                              <label class=\"active\"for=\"custom_txt_area_"+ numb.toString() + "\">Dictionary</label>\
                          </div>\
                      </div>\
                  </form>\
              </div>\
          </div>\
      </li>";


        $root.append(a);
        $("#custom_txt_area_" + numb.toString()).val(language[word].join('\n'));
        $('#custom_txt_area_' + numb.toString()).trigger('autoresize');

        numb = numb + 1;
      }
    });
  }
  )


});