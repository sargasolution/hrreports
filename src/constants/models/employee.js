class EmployeePunchEntity {
    constructor(name) {
        this.name = name;
        this.totalMinsWorked = 0;
    }
}

class EmployeeMonthlyPunchEntity extends EmployeePunchEntity {
    constructor(name, pricePerHour = 0) {
        super(name);
        this.totalAmount = 0;
        this.pricePerHour = pricePerHour;
    }
}
class EmployeeWeeklyPunchEntity extends EmployeePunchEntity {
    constructor(name, punchData) {
        super(name);
        this.punchData = punchData;
    }
}

module.exports = {
    EmployeeWeeklyPunchEntity,
    EmployeeMonthlyPunchEntity
}