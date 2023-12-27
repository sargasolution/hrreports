class EmployeeWeeklyPunchEntity {
    constructor(name, punchData) {
        this.name = name;
        this.punchData = punchData;
        this.totalMinsWorked = 0;
    }
}

module.exports = {
    EmployeeWeeklyPunchEntity
}