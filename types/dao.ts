export const DAO_ROLES: { [role: string]: string[] } = {
  admin: [
    // only we will be admin
    '0x28558Ba4343FeB2709ed7A9531B72402a7794D8D',
  ],
  organizer: [
    // these people have control over historians... ADD ACCORDINGLY
    '0x9428ca8b5fe52C33BD0BD7222d719d788B6467F4', // team.pob.eth
    '0x28558Ba4343FeB2709ed7A9531B72402a7794D8D', // studio.pob.eth
  ],
  historian: [
    /**
     * to add historians into the protocol:
     * 1. visit https://etherscan.io/address/0x7229883a69a333055B191132d2118C8a676014dD
     * 2. connect organizer wallet to etherscan
     * 3. call `grantRole`
     * param 1: role: DAO_ROLE_BYTES.historian
     * param 2: address: historian address
     **/
    '0xC6b36efcc27cdE7E0b144C5E90CbAFBC086bD630', // peppino.eth
    '0xed10fc70a816b779c44dad64b3a1d4830642bbbc', // BowTiedGopher
    '0xfc046c0955FCD9DfcB5C291cbCb5e9a6a18f5bfC', // victor.pob.eth
    '0x1ED59A628AB77245e0a56F9F93A4A56AC307aa43', // herodotus.pob.eth
    '0xb99f063aaCbbE0602A41Be67B26648506ef45600', // bulleteyedk.pob.eth
    '0x9428ca8b5fe52C33BD0BD7222d719d788B6467F4', // team.pob.eth
    '0x91f3ACF393dE794E7291FBF36DFc408Da617cfF0', // cyphr.eth
    '0xb27141A3a364E33bc76716bEB1e374B79547EB24', // kofe.pob.eth
    '0x85b6AC2dd05DfF3767E78900ab5db55C12da1b8B', // j0xrdan
    '0xE9B80B4cF85d7709583DFF27c1F51B289Cd1E152', // gabagool.eth | cryptoaccumula1
    '0x96804A3758beD8B134cd0baB838ac5b0c599c6BA', // ash.bhimasani.eth
    '0x8Bfd22d7fa34839447af3B4ED35B847DE5882dC5', // spacefe.eth (not on-chain)
    '0x2399154679959Db9647c2972c32b942C0C608E1F', // bitwizard.eth (not on-chain)
    '0x8B97066FfE92e889bD53d4dCe2b13461b8EA7Ea2', // @diagonalmethod (not on-chain)
    '0xeC444b357165241c16a9E1b54585d11e6f34a35a', // @Zip_SkullKid (not on-chain)
  ],
  scribe: [
    '0x37F64fB7Fa2fBC5f6056301273fAF8A1Fc803b7A', // davidsun.eth
    '0x96804a3758bed8b134cd0bab838ac5b0c599c6ba', // ash.bhimasani.eth
    '0x9428ca8b5fe52c33bd0bd7222d719d788b6467f4', // team.pob.eth
  ],
  hunter: [],
};

export const DAO_ROLE_BYTES = {
  historian:
    '0x1000000000000000000000000000000000000000000000000000000000000001',
  deprecatedOrganizer:
    '0x1000000000000000000000000000000000000000000000000000000000000000',
  organizer:
    '0x1000000000000000000000000000000000000000000000000000000000000002',
  admin: '0x0000000000000000000000000000000000000000000000000000000000000000',
};

export type DaoRole = keyof typeof DAO_ROLES;
