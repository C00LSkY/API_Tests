from Helper_API.API_Helper import get_request_method, post_request_method, delete_request_method
import pytest
import json
import allure
from Test_data.test_data import test_data1, orders, url_params_create, url_params_get, status_code_get, \
    status_code_post, status_code_delete


def test_create_test_data():
    """
    Проверка  метода Get create
    Returns:

    """
    with allure.step('Создание тестовых данных'):
        data2 = []
        for order in orders:
            response = post_request_method(url_params=url_params_create, status_code_post=status_code_post,
                                           params=json.dumps(order))
            data1 = json.loads(response.content)
            assert int(data1['id']) > 0 and int(data1['id']) < 1000, f'Параметры отвечают требованиям'
            assert data1['job'] == "Buy" or data1['job'] == "Sell", f'Параметры не отвечают требованиям'
          
            data2.append(data1)



@pytest.mark.parametrize('id_varibals', test_data1)
def test_one_get_method(id_varibals):
    """
    Проверка валидности метода Get orderid
    Returns:

    """
    with allure.step('Отправка запроса с параметрами'):
        response = get_request_method(url_params=url_params_get + id_varibals, status_code_get=status_code_get, params=None)
        with allure.step('Проверка валидности ответа json'):
            print(response)


@pytest.mark.parametrize('id_varibals', test_data1)
def test_check_delete(id_varibals):
    """
    Проверка  метода delete
    Returns:

    """
    with allure.step('Удаление тестовых данных по сделке'):
        response = delete_request_method(url_params=url_params_get + id_varibals, status_code_get=status_code_get, params=None)
        assert response.text , \
            f'Сделка не удалена код {response.status_code}'


def test_delete_test_data():
    """
    Проверка  метода Get clean
    Returns:

    """
    with allure.step('Удаление тестовых данных'):
        response = get_request_method(url_params='order/clean', status_code_delete=status_code_delete, params=None)
        assert response.text == '{"message": "Order book is clean."}', \
            f'Тестовые данные не удалены код {response.status_code}'