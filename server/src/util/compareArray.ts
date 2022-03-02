

function compareArray(validField: Array<any>, object: Object): boolean {
    const reqDataArray = Object.keys(object);
    const validObject = validField.map((value) => reqDataArray.map((req) => value === req && value).filter((req) => req !== false)[0]).filter((value) => value !== undefined).length === reqDataArray.length

    return validObject
}

export default compareArray