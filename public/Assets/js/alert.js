$(document).ready(function() {
    window.setTimeout(function() {
        $(".alert").fadeTo(500, 0).slideUp(500, function(){
            $(this).remove();
            $(".login-title").hide().append('<h2 class="mt-3" style="font-size: 40px; color: rgb(182, 182, 182);">LOGIN</h1>').fadeIn(500)  
        });
    }, 3000);
    
}); 