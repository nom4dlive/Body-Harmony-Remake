*** Settings ***
Library           SeleniumLibrary
Suite Setup       Open Browser    ${URL}    ${BROWSER}
Suite Teardown    Close Browser

*** Variables ***
${URL}            http://web
${BROWSER}        headlesschrome

*** Test Cases ***
Verify Home Page
    [Documentation]    Verifies that the home page loads correctly.
    Wait Until Page Contains    Body Harmony    timeout=10s
    Page Should Contain    Body Harmony

Verify Nexus Login Page
    [Documentation]    Verifies that the Nexus login page is accessible.
    Go To    ${URL}/nexus
    Wait Until Page Contains Element    xpath=//input[@placeholder='PASSPHRASE']    timeout=10s
    Page Should Contain Element    xpath=//input[@placeholder='PASSPHRASE']

Verify LMS Login Page
    [Documentation]    Verifies that the LMS login page is accessible.
    Go To    ${URL}/portal-licenciada
    Wait Until Page Contains Element    xpath=//input[@placeholder='Sua senha de acesso']    timeout=10s
    Page Should Contain Element    xpath=//input[@placeholder='Sua senha de acesso']
