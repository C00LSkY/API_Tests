from Helper_API.API_Helper import get_request_method, post_request_method, delete_request_method
import pytest
import json
import allure
from Test_data.test_data import test_data1, orders


def test_create_test_data():
    """
    Проверка  метода Get create
    Returns:

    """
    with allure.step('Создание тестовых данных'):
        for order in orders:
            post_request_method(url_params='order/create/', status_code_post=(200, 400, 404), params=json.dumps(order))


@pytest.mark.parametrize('id_varibals', test_data1)
def test_one_get_method(id_varibals):
    """
    Проверка валидности метода Get orderid
    Returns:

    """
    with allure.step('Отправка запроса с параметрами'):
        response = get_request_method(url_params=f'order?id={id_varibals}', status_code_get=(200, 400, 404), params=None)
        with allure.step('Проверка валидности ответа json'):
            print(response)


def test_check_delete():
    """
    Проверка  метода delete
    Returns:

    """
    with allure.step('Удаление тестовых данных по сделке'):
        response = delete_request_method(url_params='order?id=1', status_code_get=(200, 400, 404), params=None)
        assert response.text , \
            f'Сделка не удалена код {response.status_code}'


def test_delete_test_data():
    """
    Проверка  метода Get clean
    Returns:

    """
    with allure.step('Удаление тестовых данных'):
        response = get_request_method(url_params='order/clean', status_code_get=(200, 400, 404), params=None)
        assert response.text == '{"message": "Order book is clean."}', \
            f'Тестовые данные не удалены код {response.status_code}'