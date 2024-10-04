import { Referendum } from './referendum';

/** A ballot of referenda/elections. */
export type Ballot = {
  /**
   * The UUID identifying this ballot (same for all ballots issued with this collection of
   * referenda).
   */
  id: string,

  /** The referenda on which to be voted. */
  referenda: Array<Referendum>,

  /** Information about the ballot. */
  information?: BallotInformation,
}

/** Information about a ballot, referendum, or option. */
export type BallotInformation = {
  /** Title of the section. */
  title: string,

  /** Description of the section. */
  description: string,

  /** Link to more information. */
  infoUri?: string,

  /** Ordered list of image URIs to include. */
  imageUris?: Array<string>,
}
