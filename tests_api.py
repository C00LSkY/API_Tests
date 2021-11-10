from Helper_API.API_Helper import get_request_method, post_request_method, delete_request_method, get_precision
import pytest
import json
import allure
from Test_data.test_data import test_data1, orders, url_params_create, url_params_get, status_code_get, \
    status_code_post, status_code_delete, url_params_clear, url_params_marketdata


'''
Можно было сделать через класс запросов, но мне кажется так наглядней в данном варианте
'''

@pytest.fixture(scope='session')
def create_and_delete_test_data():
    """
    Проверка  метода Post create и get clear
    """
    with allure.step('Создание тестовых данных'):
        data2 = []
        bad_params = 0
        for order in orders:
            response = post_request_method(url_params=url_params_create, status_code_post=status_code_post,
                                           params=json.dumps(order))
            data1 = json.loads(response.content)
            if data1['id'] is not None:
                if int(data1['id']) < 0 or int(data1['id']) > 10000:
                    bad_params += 1
            if data1['price'] is not None:
                if int(data1['price']) < 0 or int(data1['price']) > 10000:
                    bad_params += 1
                if get_precision(data1['price']) < 3:
                    bad_params += 1
        assert bad_params == 0, f'Параметры ответа в количестве {bad_params} неправильные'
        assert 0 < len(data1['quantity']) < 10000, \
            'Параметры quantity не отвечают требованиям по длинне'
        assert data1['side'] == "Buy" or data1['side'] == "Sell", 'Параметры Side не отвечают требованиям'
        data2.append(data1)
    yield
    with allure.step('Очистка тестовых данных'):
        response = get_request_method(url_params=url_params_clear, status_code_delete=status_code_delete, params=None)
        assert response.text == '{"message": "Order book is clean."}', \
            f'Тестовые данные не удалены код {response.status_code}'


@pytest.mark.parametrize('id_varibals', test_data1)
def test_one_get_method(id_varibals):
    """
    Проверка валидности метода Get orderid
    """
    with allure.step('Отправка запроса с параметрами'):
        response = get_request_method(url_params=url_params_get + id_varibals, status_code_get=status_code_get,
                                      params=None)
        with allure.step('Проверка валидности ответа json'):
            data1 = json.loads(response.content)
            assert isinstance(data1['id'], str), 'Параметры Id не отвечают требованиям'
            assert isinstance(data1['price'],str), 'Параметры price не отвечают требованиям'
            assert isinstance(data1['quantity'], str), \
                'Параметры quantity не отвечают требованиям'
            assert isinstance(data1['side'], str), 'Параметры Side не отвечают требованиям'
            assert data1['side'] == "Buy" or data1['side'] == "Sell", 'Параметры Side не отвечают требованиям'


@pytest.mark.parametrize('id_varibals', test_data1)
def test_check_delete(id_varibals):
    """
    Проверка  метода delete
    """
    with allure.step('Удаление тестовых данных по сделке'):
        response = delete_request_method(url_params=url_params_get + id_varibals, status_code_get=status_code_get,
                                         params=None)
    with allure.step('Проверка валидности ответа json'):
        data1 = json.loads(response.content)
        assert isinstance(data1['id'], str), 'Параметры Id не отвечают требованиям'
        assert isinstance(data1['price'], str), 'Параметры price не отвечают требованиям'
        assert isinstance(data1['quantity'], str), \
            'Параметры quantity не отвечают требованиям'
        assert isinstance(data1['side'], str), 'Параметры Side не отвечают требованиям'
        assert data1['side'] == "Buy" or data1['side'] == "Sell", 'Параметры Side не отвечают требованиям'


def test_one_get_marketdata():
    """
    Проверка  метода Get marketdata
    """
    with allure.step('Отправка запроса с параметрами'):
        response = get_request_method(url_params=url_params_marketdata, status_code_get=status_code_get,
                                      params=None)
        with allure.step('Проверка валидности ответа json'):
            data1 = json.loads(response.content)
            for i in data1[1]:
                assert i['price'] is not None, 'Параметры price не отвечают требованиям'
                assert i['quantity'] is not None, 'Параметры quantity не отвечают требованиям'

