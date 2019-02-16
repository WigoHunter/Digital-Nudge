// eslint-disable-next-line no-undef
SyncedCron.add({
	name: "Check users calendar events at 7am.",
	schedule: parser => parser.text("at 07:00 am"),
	job: () => {
		// TODO
	}
});