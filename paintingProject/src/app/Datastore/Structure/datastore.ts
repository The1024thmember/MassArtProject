// This is layer that exposed to FE for making API requests, when instantiate DataStore<Collection>() or
// DataStore<Document>() object, a REQUEST_DATA action is dispatched, request-data.effect.ts will listen
// to that action and call fetch() function in backend.ts for data and store in Datastore. On instantiating
// the Document or Collection object, it also uses store$.select() to get the current data from store, so
// Document or Collection are directly used as data in FE.
