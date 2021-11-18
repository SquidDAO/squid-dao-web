export const pastAuctionsQuery = (first: number = 50) => `
  query {
    auctions(orderBy: startTime, first: ${first}) {
      id
      amount
      settled
      bidder {
        id
      }
      startTime
      endTime
      bids {
        id
        amount
        blockNumber
        blockTimestamp
        bidder {
          id
        }
      }
    }
  }
`;
