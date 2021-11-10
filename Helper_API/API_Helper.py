import requests
from Test_data.test_data import url, headers


def get_request_method(url_params, params, status_code_get):
    response = requests.get(url=url + url_params, headers=headers, data=params)
    assert response.status_code in status_code_get, \
        f"Статус код ответа не соответствует требованиям и равен {response.status_code}"
    assert response, f"Ответ от сервера не 200 Ок. Статус код ={response.status_code}, {response.text}"
    return response


def delete_request_method(url_params, params, status_code_delete):
    response = requests.delete(url=url + url_params, headers=headers, data=params)
    assert response.status_code in status_code_delete, \
        f"Статус код ответа не соответствует требованиям и равен {response.status_code}"
    assert response, f"Ответ от сервера не 200 Ок. Статус код ={response.status_code}, {response.text}"
    return response


def post_request_method(url_params, params, status_code_post):
    response = requests.post(url=url + url_params, headers=headers, data=params)
    assert response.status_code in status_code_post, \
        f"Статус код ответа не соответствует требованиям и равен {response.status_code}"
    assert response, f"Ответ от сервера не 200 Ок. Статус код ={response.status_code}, {response.text}"
    return response


def get_precision(chislo):
    str_f = str(chislo)
    if '.' not in str_f:
        return 0
    return len(str_f[str_f.index('.') + 1:])
