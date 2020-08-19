var bookNowVisibility = !0,
    div_top = 50;
$("#sticky-header") && $("#sticky-header").offset() && (div_top = $("#sticky-header").offset().top + 50);
function sticky_header() {
    $(window).scrollTop() > div_top
        ? ($("#bookNowNrml").hide(),
          $("#ha-header").removeClass("ha-header-subshow"),
          $("#ha-header").addClass("ha-header-show"),
          $("#sticky-header").height(0),
          $(".navbar-header .navbar-toggle").addClass("collapsed"),
          $("#sterling-navbar").addClass("collapse").removeClass("in"),
          $(".small-menu-not-logged-in").removeClass("visible-xs"),
          $(".lg-menu-not-logged-in").hide())
        : ($("#bookNowNrml").show(),
          $("#ha-header").removeClass("ha-header-show"),
          $("#ha-header").addClass("ha-header-subshow"),
          $("#sticky-header").height(0),
          $(".small-menu-not-logged-in").addClass("visible-xs"),
          $(".lg-menu-not-logged-in").show());
}
$(function () {
    $(window).scroll(sticky_header);
        sticky_header();
    
    if($(window).width() < 576){
        $('#sterling-navbar').removeClass('show');
    }
    $(window).on('resize',function(){
        if($(window).width() < 576 ){
            $('#sterling-navbar').removeClass('show');
        }
        else{
            $('#sterling-navbar').addClass('show');
        }
    })
   
});
$(".logo").data("size", "big");
$(window).scroll(function () {
    1024 < $(window).width() &&
        ($(document).scrollTop() > div_top
            ? "big" == $(".logo").data("size") && ($(".logo").data("size", "small"), bookNowVisibility || $("#stickyBookNow").removeClass("booknow"))
            : "small" == $(".logo").data("size") && $(".logo").data("size", "big"));
});