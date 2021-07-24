import { ConnectionPool } from 'mssql';
import {
  Ballot, Referendum, ReferendumOption, ReferendumSelector,
} from './ballots.model';

export interface BallotDal {
  getBallot(id: string): Promise<Ballot | null>;

  submitBallot(voteId: string, encryptedVoteId: string, ballot: Ballot): Promise<boolean>;
}

export class TSqlBallotDal implements BallotDal {
  constructor(
    private pool: ConnectionPool,
  ) {}

  async getBallot(id: string): Promise<Ballot | null> {
    const request = this.pool.request();

    // get raw ballot
    const ballotsQuery = `
    SELECT id, title, description, infoUri
    FROM Ballots
    WHERE id = @ballotId;
    `;
    type RawBallotInformation = {
      title: string,
      description: string,
      infoUri: string | null,
    };
    type RawBallot = {
      id: string,
    } & RawBallotInformation;
    request.input('ballotId', id);
    const rawBallot = await request.query<RawBallot>(ballotsQuery);

    // get raw referenda
    const referendaQuery = `
    SELECT id, selector, maxSelections, title, description, infoUri
    FROM Referenda
    WHERE ballotId IN @ballotId;
    `;
    type RawReferendum = {
      id: string,
      selector: ReferendumSelector,
      maxSelections: number | null,
    } & RawBallotInformation;
    const rawReferenda = await request.query<RawReferendum>(referendaQuery);

    // get raw referenda options
    const referendaOptionsQuery = `
    SELECT referendumId, id, title, description, infoUri
    FROM ReferendumOptions
    WHERE referendumId IN @referendaIds;
    `;
    type RawReferendumOption = {
      referendumId: string,
      id: string,
    } & RawBallotInformation;
    request.input('referendaIds', rawReferenda.recordset.map((r) => r.id));
    const rawReferendaOptions = await request.query<RawReferendumOption>(referendaOptionsQuery);

    if (!rawBallot?.recordset?.length || !rawReferenda?.recordset?.length) {
      return null;
    }
    return {
      id: rawBallot.recordset[0].id,
      information: {
        title: rawBallot.recordset[0].title,
        description: rawBallot.recordset[0].description,
        infoUri: rawBallot.recordset[0].infoUri ?? undefined,
      },
      referenda: rawReferenda.recordset.map((referendum): Referendum => ({
        id: referendum.id,
        information: {
          title: referendum.title,
          description: referendum.description,
          infoUri: referendum.infoUri ?? undefined,
        },
        options: rawReferendaOptions.recordset.reduce((options, option) => {
          if (option.referendumId === referendum.id) {
            options.push({
              id: option.id,
              information: {
                title: option.title,
                description: option.description,
                infoUri: option.infoUri ?? null,
              },
            });
          }
          return options;
        }, [] as Array<ReferendumOption>),
        selector: referendum.selector,
        maxSelections: referendum.maxSelections ?? undefined,
      })),
    };
  }

  submitBallot(voteId: string, encryptedVoteId: string, ballot: Ballot): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
