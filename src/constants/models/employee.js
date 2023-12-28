class EmployeeMonthlyPunchEntity {
    constructor(name) {
        this.name = name;
        this.totalMinsWorked = 0;
    }
}
class EmployeeWeeklyPunchEntity extends EmployeeMonthlyPunchEntity {
    constructor(name, punchData) {
        super(name);
        this.punchData = punchData;
    }
}

module.exports = {
    EmployeeWeeklyPunchEntity,
    EmployeeMonthlyPunchEntity
}