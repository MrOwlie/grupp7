<!DOCTYPE html>
<html>
  <body>
    <div id="SensorData">
    </div>
    <script src="http://code.jquery.com/jquery-latest.min.js" type="text/javascript"></script>
    <script language="javascript" type="text/javascript">
    $(document).ready(function(){
      $("button").click(function(){
        $.ajax({
          url: '',
          type: 'POST',
          dataType: 'JSON',
          success: function(data){
            $.each( data, function( key, val){
              $('#SensorData').append("< li id='" + key "'>" + val "</li");
            });
          }
        });
      });
    });

    </script>
  </body>
</html>
