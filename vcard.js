"use strict";
// vcard parser?

function strcut (str, char) {
	let i = str.indexOf(char);

	return i >= 0 ? [str.slice(0, i), str.slice(i + char.length)] : [str];
}

const VCF = {
	properties: {
		BEGIN: {required: true},
		END: {required: true},
		SOURCE: {},
		KIND: {},
		XML: {},
		FN: {required: true},
		N: {},
		NICKNAME: {},
		PHOTO: {},
		BDAY: {},
		ANNIVERSARY: {},
		GENDER: {},
		ADR: {},
		TEL: {},
		EMAIL: {},
		IMPP: {},
		LANG: {},
		TZ: {},
		GEO: {},
		TITLE: {},
		ROLE: {},
		LOGO: {},
		ORG: {},
		MEMBER: {},
		RELATED: {},
		CATEGORIES: {},
		NOTE: {},
		PRODID: {},
		REV: {},
		SOUND: {},
		UID: {},
		CLIENTPIDMAP: {},
		VERSION: {required: true},
		KEY: {},
		FBURL: {},
		CALADRURI: {},
		CALURI: {}
	},
	parse: function (text) {
		let ret = [], vcard;
		text.replace(/[\r\n]+[ \t]+/g, '').split(/[\r\n]+/).forEach(line => {
			line = strcut(line, ':');
			let value = line[1], params = line[0].split(';'), entry;
			let group = strcut(params.shift(), '.');
			let tag = group.pop();
			group = group[0];
			params = params.reduce((o, m) => {
				m = strcut(m, '=');
				m[0] = m[0].toUpperCase();
				o[m[0]] = o[m[0]] ? o[m[0]] : [];
				o[m[0]].push(m[1]);

				return o;
			}, {});

			switch (tag.toUpperCase()) {
			case "BEGIN":
				if (value.toUpperCase() === 'VCARD') {
					if (vcard) {
						ret.push(vcard);
					}

					vcard = {};
				}

				break;
			case "END":
				if (vcard && value.toUpperCase() === 'VCARD') {
					ret.push(vcard);
					vcard = null;
				}

				break;
			default:
				if (vcard && tag) {
					entry = {};

					if (group) {
						vcard.groups = vcard.groups ? vcard.groups : {};
						vcard.groups[group] = vcard.groups[group] ? vcard.groups[group] : [];
						vcard.groups[group].push(entry);
					} else {
						vcard.entries = vcard.entries ? vcard.entries : [];
						vcard.entries.push(entry);
					}

					entry.TAG = tag.toUpperCase();

					if (Object.keys(params).length) {
						entry.PARAMS = params;
					}

					if (value !== undefined) {
						entry.VALUE = value;
					}
				}

				break;
			}
		});

		if (vcard) {
			ret.push(vcard);
		}

		return ret;
	},
	stringify: function (obj) {
		if (obj.length) {
			return obj.map(this.stringify).join('');
		}

		let ret = 'BEGIN:VCARD\r\n';
		ret += obj.entries.map(entry => {
			let e = entry.TAG;

			if (entry.PARAMS) {
				for (let k in entry.PARAMS) {
					if (entry.PARAMS[k].length) {
						entry.PARAMS[k].forEach(v => {
							e += ';' + k + '=' + v;
						});
					} else {
						e += ';' + k;
					}
				}
			}

			e += ':' + entry.VALUE;

			return e;
		}).join('\r\n') + '\r\n';

		for (let g in obj.groups) {
			ret += obj.groups[g].map(entry => {
				let e = g + '.' + entry.TAG;

				if (entry.PARAMS) {
					for (let k in entry.PARAMS) {
						if (entry.PARAMS[k].length) {
							entry.PARAMS[k].forEach(v => {
								e += ';' + k + '=' + v;
							});
						} else {
							e += ';' + k;
						}
					}
				}

				e += ':' + entry.VALUE;

				return e;
			}).join('\r\n') + '\r\n';
		}

		ret += 'END:VCARD\r\n';

		return ret;
	}
};

/* globals module */
try {
	module.exports = VCF;
} catch (e) {
	// do nothing
}

