
test_data1 = (0, 1, None, 1000, 100000000000000000000, True, 'Сто')

headers = {'Content-Type': 'application/json'}

url = "http://94.130.158.237:47722/api/"

url_params_create = 'order/create/'
url_params_get = 'order?id='
url_params_clear = 'order/clean'
url_params_marketdata = 'marketdata'

status_code_get = (200, 400, 404)
status_code_post = (200, 400, 404)
status_code_delete = (200, 400, 404)

orders = [
    {
        "price": "100",
        "quantity": "2",
        "side": "Sell"
    },
    {
        "price": "500.50",
        "quantity": "1",
        "side": "Buy"
    }
    ,
    {
        "price": "0.5",
        "quantity": "2",
        "side": "Buy"
    }
    ]