import { ChainId as ImportedChainId } from "blockchain-addressbook/build/address-book";

enum LocalChainId {
  // bttc = 199,
}
type ChainId = ImportedChainId | LocalChainId
const ChainId = {...ImportedChainId, ...LocalChainId}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const BASE_HPY = 547; // 1.5 times per day in a year.
const MINUTELY_HPY = 525600;
const HOURLY_HPY = 8760;
const DAILY_HPY = 365;
const WEEKLY_HPY = 52;

const BSC_RPC = process.env.BSC_RPC || "https://bsc-dataseed.binance.org";
const HECO_RPC = process.env.HECO_RPC || "https://http-mainnet.hecochain.com";
const AVAX_RPC =
  process.env.AVAX_RPC || "https://api.avax.network/ext/bc/C/rpc";
const POLYGON_RPC = process.env.POLYGON_RPC || "https://polygon-rpc.com/";
const FANTOM_RPC = process.env.FANTOM_RPC || "https://rpc.ftm.tools";
const ONE_RPC = process.env.ONE_RPC || "https://api.harmony.one/";
const ARBITRUM_RPC = process.env.ARBITRUM_RPC || "https://arb1.arbitrum.io/rpc";
const CELO_RPC = process.env.CELO_RPC || "https://forno.celo.org";
const MOONRIVER_RPC =
  process.env.MOONRIVER_RPC || "https://rpc.moonriver.moonbeam.network";
const CRONOS_RPC = process.env.CRONOS_RPC || "https://evm.cronos.org";
const AURORA_RPC =
  process.env.AURORA_RPC ||
  "https://mainnet.aurora.dev/Fon6fPMs5rCdJc4mxX4kiSK1vsKdzc3D8k6UF8aruek";
const FUSE_RPC = process.env.FUSE_RPC || "https://rpc.fuse.io";
const METIS_RPC =
  process.env.METIS_RPC || "https://andromeda.metis.io/?owner=1088";
const MOONBEAM_RPC =
  process.env.METIS_RPC || "https://rpc.api.moonbeam.network";
const SYS_RPC = process.env.SYS_RPC || "https://rpc.syscoin.org";
const EMERALD_RPC = process.env.EMERALD_RPC || "https://emerald.oasis.dev";
const OPTIMISM_RPC = process.env.OPTIMISM_RPC || 'https://mainnet.optimism.io';

const BSC_CHAIN_ID = ChainId.bsc;
const HECO_CHAIN_ID = ChainId.heco;
const POLYGON_CHAIN_ID = ChainId.polygon;
const AVAX_CHAIN_ID = ChainId.avax;
const FANTOM_CHAIN_ID = ChainId.fantom;
const ONE_CHAIN_ID = ChainId.one;
const ARBITRUM_CHAIN_ID = ChainId.arbitrum;
const CELO_CHAIN_ID = ChainId.celo;
const MOONRIVER_CHAIN_ID = ChainId.moonriver;
const CRONOS_CHAIN_ID = ChainId.cronos;
const AURORA_CHAIN_ID = ChainId.aurora;
const FUSE_CHAIN_ID = ChainId.fuse;
const METIS_CHAIN_ID = ChainId.metis;
const MOONBEAM_CHAIN_ID = ChainId.moonbeam;
const SYS_CHAIN_ID = ChainId.sys;
const EMERALD_CHAIN_ID = ChainId.emerald;
const OPTIMISM_CHAIN_ID = ChainId.optimism;

const MULTICHAIN_RPC: Record<ChainId, string> = {
  [ChainId.bsc]: BSC_RPC,
  [ChainId.heco]: HECO_RPC,
  [ChainId.polygon]: POLYGON_RPC,
  [ChainId.avax]: AVAX_RPC,
  [ChainId.fantom]: FANTOM_RPC,
  [ChainId.one]: ONE_RPC,
  [ChainId.arbitrum]: ARBITRUM_RPC,
  [ChainId.celo]: CELO_RPC,
  [ChainId.moonriver]: MOONRIVER_RPC,
  [ChainId.cronos]: CRONOS_RPC,
  [ChainId.aurora]: AURORA_RPC,
  [ChainId.fuse]: FUSE_RPC,
  [ChainId.metis]: METIS_RPC,
  [ChainId.moonbeam]: MOONBEAM_RPC,
  [ChainId.sys]: SYS_RPC,
  [ChainId.emerald]: EMERALD_RPC,
  [ChainId.optimism]: OPTIMISM_RPC,
};

const MULTICHAIN_GAS: Record<ChainId, any> = {
  [ChainId.bsc]: {
    wrapped: "WBNB",
    symbol: "BNB",
    address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    decimals: 18,
    isGas: true,
  },
  [ChainId.heco]: {},
  [ChainId.polygon]: {
    wrapped: "WMATIC",
    symbol: "MATIC",
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    decimals: 18,
    isGas: true,
  },
  [ChainId.avax]: {},
  [ChainId.fantom]: {
    wrapped: "WFTM",
    symbol: "FTM",
    address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    decimals: 18,
    isGas: true,
  },
  [ChainId.one]: {},
  [ChainId.arbitrum]: {},
  [ChainId.celo]: {},
  [ChainId.moonriver]: {},
  [ChainId.cronos]: {
    wrapped: "WCRO",
    symbol: "CRO",
    address: "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
    decimals: 18,
    isGas: true,
  },
  [ChainId.aurora]: {},
  [ChainId.fuse]: {},
  [ChainId.metis]: {},
  [ChainId.moonbeam]: {
    wrapped: "WGLMR",
    symbol: "GLMR",
    address: "0xAcc15dC74880C9944775448304B263D191c6077F",
    decimals: 18,
    isGas: true,
  },
  [ChainId.sys]: {},
  [ChainId.emerald]: {},
  [ChainId.optimism]: {},
};

export {
  BSC_RPC,
  BSC_CHAIN_ID,
  HECO_RPC,
  HECO_CHAIN_ID,
  AVAX_RPC,
  AVAX_CHAIN_ID,
  POLYGON_RPC,
  POLYGON_CHAIN_ID,
  FANTOM_RPC,
  FANTOM_CHAIN_ID,
  ONE_RPC,
  ONE_CHAIN_ID,
  ARBITRUM_RPC,
  ARBITRUM_CHAIN_ID,
  CELO_RPC,
  CELO_CHAIN_ID,
  MOONRIVER_RPC,
  MOONRIVER_CHAIN_ID,
  CRONOS_RPC,
  CRONOS_CHAIN_ID,
  AURORA_RPC,
  AURORA_CHAIN_ID,
  FUSE_RPC,
  FUSE_CHAIN_ID,
  METIS_RPC,
  METIS_CHAIN_ID,
  MOONBEAM_RPC,
  MOONBEAM_CHAIN_ID,
  SYS_RPC,
  SYS_CHAIN_ID,
  EMERALD_RPC,
  EMERALD_CHAIN_ID,
  OPTIMISM_RPC,
  OPTIMISM_CHAIN_ID,
  BASE_HPY,
  MINUTELY_HPY,
  HOURLY_HPY,
  DAILY_HPY,
  WEEKLY_HPY,
  MULTICHAIN_RPC,
  ZERO_ADDRESS,
  ChainId,
  MULTICHAIN_GAS,
};
