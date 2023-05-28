export class DatastoreMissingModuleError extends Error {
  constructor(collectionName: string) {
    super(
      `Missing collection "${collectionName}".
        Check if you've imported Datastore${collectionName
          .charAt(0)
          .toUpperCase()}${collectionName.substring(
        1
      )}Module in the parent module of any component that needs it.`
    );
  }
}
