
var mailformat = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

function validacion() {
  if (document.miFormu.nombre.value == "") {
    alert("Ingresar nombre");
    return false
    document.miFormu.nombre.focus()

    } else if (document.miFormu.correo.value == "") {
    alert("Ingresar correo");
    return false
    document.miFormu.correo.focus()

    }else if (!document.miFormu.correo.value.match(mailformat))
            {alert ("Ingrese email valido");
            return false
                document.miFormu.correo.focus()
                


              } else if (document.miFormu.pedido.value == "") 
              {alert("Ingresar pedido");
              return false
                document.miFormu.pedido.focus()
    
      } else if (document.miFormu.pedido.value =true) 
            {{alert("Su pedido ha sido ingresado. Gracias por comprar con nosotros!");}
      
            return true
    
      }
    }
    

    $(document).ready(function() {
      $('#example').DataTable( {
          "language": {
              "lengthMenu": "Mostrar _MENU_ Registros por pagina",
              "zeroRecords": "No se encontraron registros",
              "info": "Mostrando pagina _PAGE_ de _PAGES_",
              "thousands":      ".",
              "infoFiltered": "(filtrado de _MAX_ registros totales)",
              "infoEmpty":      "Mostrando 0 a 0 de 0 entradas",
              "paginate": {
          "first":      "Primero",
          "last":       "Ultimo",
          "next":       "Siguiente",
          "previous":   "Anterior"
      },
              "search":         "Buscar:",
          }
      } );
      $('#example').show();
    
    } );