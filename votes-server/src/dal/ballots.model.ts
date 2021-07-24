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
  information: BallotInformation,
}

/** Information about a ballot, referendum, or option. */
export type BallotInformation = {
  /** Title of the section. */
  title: string,

  /** Description of the section. */
  description: string,

  /** Link to more information. */
  infoUri?: string | null,
}

/** An item on which to be voted. */
export type Referendum = {
  /** The UUID identifying this referendum across all ballots. */
  id: string,

  /** Information about the referendum. */
  information: BallotInformation,

  /** The options to select for voting. */
  options: Array<ReferendumOption>,

  /** The method of selection among the options. */
  selector: ReferendumSelector,

  /**
   * The maximum number of options that can be selected. By default, implementations should default
   * this to 1 for single-choice and to the length of "options" for multi- and ranked-choice.
   */
  maxSelections?: number,
}

/** An option to select when voting on a referendum. */
export type ReferendumOption = {
  /** The UUID identifying this referendum option across all ballots. */
  id: string,

  /** Information for the option. */
  information: BallotInformation,
}

/** How selections can be made for the referendum. */
export type ReferendumSelector = 'single-choice' | 'multi-choice' | 'ranked-choice';

export interface KeyRepo {
  getPublicKey(fingerprint: string): Promise<string>;
}
