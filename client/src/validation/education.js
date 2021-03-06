const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateEducationInput(data) {
	let errors = {};

	data.school = !isEmpty(data.school) ? data.school : '';
	data.degree = !isEmpty(data.degree) ? data.degree : '';
	data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : '';
	data.from = !isEmpty(data.from) ? data.from : '';

	if (Validator.isEmpty(data.school)) {
		errors.schoolError = 'School field is required';
	}

	if (Validator.isEmpty(data.degree)) {
		errors.degreeError = 'Degree field is required';
	}

	if (Validator.isEmpty(data.fieldofstudy)) {
		errors.fieldofstudyError = 'Field of study field is required';
	}

	if (Validator.isEmpty(data.from)) {
		errors.fromError = 'From date field is required';
	}

	return {
		errors,
		isValid: isEmpty(errors),
	};
};
