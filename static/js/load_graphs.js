$(document).ready(function() {
    $(".category").click(function(){
        console.log("Hello!");
        $.ajax({
            url: "/review/category",
            type: "GET",
            success: function(response){
                $(".awesome").html(response);
            }
        });
    });
});
