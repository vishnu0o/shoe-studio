
function addtocart(id, stock) {
    if (stock > 0) {
        $.ajax({
            type: "GET",
            url: `/addtocart?id=${id}`,
            success: function (data) {
                if (data.success) {
                    swal({
                        title: "sucess",
                        text: data.message,
                        icon: "success",
                        button: "oh yes!",
                    });
                    $(`#grandtotal`).text(data.grandtotal)

                } else {
                    location.href = '/login'
                }
            },
            error: function (data) {
                console.log(error);
            }
        });
    } else {
        $('#modalbody').text('Out of Stock')
        $('#exampleModal').modal('show')

    }

}
function addtowishlist(id) {

    $.ajax({
        type: "GET",
        url: `/addtowishlist?id=${id}`,
        success: function (data) {
            if (data.success) {
                swal({
                    title: "sucess",
                    text: data.message,
                    icon: "success",
                    button: "oh yes!",
                });
            } else {
                location.href = '/login'
            }
        },
        error: function (data) {
            console.log(error);
        }
    });
}




function removewishlist(productId) {
    $.ajax({
        type: "GET",
        url: `/deletewishlist?id=${productId}`,
        success: function (response) {
            // handle successful response
            //   swal({  
            //       title: "Good job!",  
            //       text: response.message,  
            //       icon: "success",  
            //       button: "oh yes!",
            //   });     
            const divToRemove = document.getElementById(productId);
            divToRemove.style.display = 'none';
            const div = document.getElementById('empty1234')
            response.qua === 1 ? div.style.display = 'block' : console.log('sflssfjnfjbsf');

            const heading = document.getElementById('heading')
            heading.style.display = 'none';

        },
        error: function (xhr, status, error) {
            // handle error response
        }
    });
}





function removecart(productId) {
    $.ajax({
        type: "GET",
        url: `/deletecart?id=${productId}`,
        success: function (response) {
            // swal({  
            //     title: "warning",  
            //     text: response.message,  
            //     icon: "warning",  
            //     button: "oh yes!",
            // });    
            const divToRemove = document.getElementById(productId);
            divToRemove.style.display = 'none';
            const div = document.getElementById('empty123')
            response.qua === 1 ? div.style.display = 'block' : console.log('sflssfjnfjbsf');

            const heading = document.getElementById('cartheading')
            cartheading.style.display = 'none';
            document.getElementById('grandtotal').textContent = response.grandtotal



        },
        error: function (xhr, status, error) {
            // handle error response
        }
    });
}



//////////  discount coupon script ////////////




$(document).ready(function () {
    $('#0option1').click()
})
console.log($('#search12').val());
function coupon() {
    let search = $('#search12').val()
    $.ajax({
        type: "post",
        url: '/redeem',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ search }),
        success: ((res) => {
            if (res.success) {
                $('.grand').text(res.grand)
                $('#search12').val('')
            } if (res.error) {
                $('#error').text(res.message)
            }
        }),


    })


}



let copybtn = document.querySelector(".copybtn");


function copyIt() {
    console.log('hai')
    let copyInput = document.querySelector('#copyvalue');

    copyInput.select();

    document.execCommand("copy");

    copybtn.textContent = "COPIED";
}




