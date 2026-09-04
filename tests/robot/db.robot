*** Settings ***
Library           DatabaseLibrary

*** Variables ***
${DB_NAME}        body_harmony_db
${DB_USER}        root
${DB_PASS}        root
${DB_HOST}        db
${DB_PORT}        3306

*** Test Cases ***
Verify Students Table
    [Documentation]    Verifies that the students table exists and has records.
    Connect To Database    pymysql    ${DB_NAME}    ${DB_USER}    ${DB_PASS}    ${DB_HOST}    ${DB_PORT}
    Table Must Exist    students
    Check Row Count    SELECT * FROM students    >    0
    Disconnect From Database

Verify Migration Tracking
    [Documentation]    Verifies that key infrastructure tables exist.
    Connect To Database    pymysql    ${DB_NAME}    ${DB_USER}    ${DB_PASS}    ${DB_HOST}    ${DB_PORT}
    Table Must Exist    admin_users
    Table Must Exist    lms_progress
    Disconnect From Database
