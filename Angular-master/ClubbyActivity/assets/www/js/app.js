function print_log(log)
{
    console.log("[CLUBBY] " + log);
}

function showToastMsg(msg) 
{
    window.plugins.toast.showShortCenter(msg, 
                        function(a){print_log('toast success: ' + a)}, 
                        function(b){alert('toast error: ' + b)});
}
