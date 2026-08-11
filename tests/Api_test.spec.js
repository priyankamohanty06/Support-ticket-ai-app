import {test, expect } from '@playwright/test';
import exp from 'constants';

test('API get request' , async({request})=>
{
    const response = await request.get('https://reqres.in/api/test-suite/collections/users/records')
    expect(response.status()).toBe(200)
    const text= await response.text();
    expect(page).toContain('1')
    console.log(await response.json());
})