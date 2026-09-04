*** Settings ***
Library           RequestsLibrary

*** Variables ***
${BASE_URL}       http://web/api/v1

*** Test Cases ***
Verify API Health
    [Documentation]    Checks if the API is reachable (expecting 200 on /ping).
    Create Session    api    ${BASE_URL}
    ${response}=    GET On Session    api    /ping
    Should Be Equal As Strings    ${response.status_code}    200

Verify Public Config
    [Documentation]    Verifies that the public site config endpoint returns data.
    Create Session    api    ${BASE_URL}
    ${response}=    GET On Session    api    /site_config
    Should Be Equal As Strings    ${response.status_code}    200
