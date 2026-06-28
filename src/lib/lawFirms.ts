// Law firms sourced from Chambers Malaysia rankings, Malaysian Bar legal directory,
// and public firm directories. Covers all 13 states + 3 federal territories.

import type { MalaysianState } from "./types";
export type { MalaysianState };

export interface LawFirmOption {
  id: string;
  name: string;
  state: MalaysianState;
}

export const LAW_FIRMS: LawFirmOption[] = [
  // ── Johor ─────────────────────────────────────────────────────────────────
  { id: "lf-j01", name: "Azim, Tunku Farik & Wong",            state: "Johor" },
  { id: "lf-j02", name: "Gan & Krishnan",                      state: "Johor" },
  { id: "lf-j03", name: "Jayadeep, Hari & Jamil",              state: "Johor" },
  { id: "lf-j04", name: "Johor Bahru Law Group",               state: "Johor" },
  { id: "lf-j05", name: "Kamaruddin & Partners",               state: "Johor" },
  { id: "lf-j06", name: "Low, Looi & Partners",                state: "Johor" },
  { id: "lf-j07", name: "Netto & Netto",                       state: "Johor" },
  { id: "lf-j08", name: "Tan Kee Pheng & Co",                  state: "Johor" },
  { id: "lf-j09", name: "Wan Ahmad & Partners",                state: "Johor" },
  { id: "lf-j10", name: "Zulpadli & Edham",                   state: "Johor" },

  // ── Kedah ─────────────────────────────────────────────────────────────────
  { id: "lf-kd1", name: "Che Wan & Partners",                  state: "Kedah" },
  { id: "lf-kd2", name: "Hashim & Co",                         state: "Kedah" },
  { id: "lf-kd3", name: "Ibrahim Marican & Co",                state: "Kedah" },
  { id: "lf-kd4", name: "Khoo & Associates",                   state: "Kedah" },
  { id: "lf-kd5", name: "Lim Keat Siew & Co",                  state: "Kedah" },

  // ── Kelantan ──────────────────────────────────────────────────────────────
  { id: "lf-ke1", name: "Abdullah & Zainudin",                 state: "Kelantan" },
  { id: "lf-ke2", name: "Nik Ibrahim & Co",                    state: "Kelantan" },
  { id: "lf-ke3", name: "Razali & Partners",                   state: "Kelantan" },
  { id: "lf-ke4", name: "Wan Roslan & Co",                     state: "Kelantan" },
  { id: "lf-ke5", name: "Zulkifli Wahab & Co",                 state: "Kelantan" },

  // ── Kuala Lumpur ──────────────────────────────────────────────────────────
  { id: "lf-kl01", name: "Adnan Sundra & Low",                 state: "Kuala Lumpur" },
  { id: "lf-kl02", name: "Alan Kang & Co",                     state: "Kuala Lumpur" },
  { id: "lf-kl03", name: "Azman Davidson & Co",                state: "Kuala Lumpur" },
  { id: "lf-kl04", name: "Azmi & Associates",                  state: "Kuala Lumpur" },
  { id: "lf-kl05", name: "Cheang & Ariff",                     state: "Kuala Lumpur" },
  { id: "lf-kl06", name: "Christopher & Lee Ong",              state: "Kuala Lumpur" },
  { id: "lf-kl07", name: "Clara Wong & Co",                    state: "Kuala Lumpur" },
  { id: "lf-kl08", name: "Ezrilaw Firm",                       state: "Kuala Lumpur" },
  { id: "lf-kl09", name: "Foong & Partners",                   state: "Kuala Lumpur" },
  { id: "lf-kl10", name: "Goik, Ramesh & Loo",                 state: "Kuala Lumpur" },
  { id: "lf-kl11", name: "Halim Hong & Quek",                  state: "Kuala Lumpur" },
  { id: "lf-kl12", name: "Jeff Leong, Poon & Wong",            state: "Kuala Lumpur" },
  { id: "lf-kl13", name: "Jeffrey & Co",                       state: "Kuala Lumpur" },
  { id: "lf-kl14", name: "Kadir Andri & Partners",             state: "Kuala Lumpur" },
  { id: "lf-kl15", name: "Koo Chin Nam & Co",                  state: "Kuala Lumpur" },
  { id: "lf-kl16", name: "Kuek, Ong & Associates",             state: "Kuala Lumpur" },
  { id: "lf-kl17", name: "Lee Hishammuddin Allen & Gledhill",  state: "Kuala Lumpur" },
  { id: "lf-kl18", name: "Low & Partners",                     state: "Kuala Lumpur" },
  { id: "lf-kl19", name: "MahWengKwai & Associates",           state: "Kuala Lumpur" },
  { id: "lf-kl20", name: "Michael Tie & Co",                   state: "Kuala Lumpur" },
  { id: "lf-kl21", name: "Nik Saghir & Ismail",               state: "Kuala Lumpur" },
  { id: "lf-kl22", name: "PS Law",                             state: "Kuala Lumpur" },
  { id: "lf-kl23", name: "Rafidah Wong & Co",                  state: "Kuala Lumpur" },
  { id: "lf-kl24", name: "Rahmat Lim & Partners",              state: "Kuala Lumpur" },
  { id: "lf-kl25", name: "Raja, Darryl & Loh",                 state: "Kuala Lumpur" },
  { id: "lf-kl26", name: "Shearn Delamore & Co",               state: "Kuala Lumpur" },
  { id: "lf-kl27", name: "Shook Lin & Bok",                    state: "Kuala Lumpur" },
  { id: "lf-kl28", name: "Skrine",                             state: "Kuala Lumpur" },
  { id: "lf-kl29", name: "Suppiah & Partners",                 state: "Kuala Lumpur" },
  { id: "lf-kl30", name: "Tay & Partners",                     state: "Kuala Lumpur" },
  { id: "lf-kl31", name: "Teh & Yu",                           state: "Kuala Lumpur" },
  { id: "lf-kl32", name: "Thomas Philip",                      state: "Kuala Lumpur" },
  { id: "lf-kl33", name: "WenJie & Co",                        state: "Kuala Lumpur" },
  { id: "lf-kl34", name: "Wong & Partners",                    state: "Kuala Lumpur" },
  { id: "lf-kl35", name: "Zaid Ibrahim & Co",                  state: "Kuala Lumpur" },
  { id: "lf-kl36", name: "Zain & Co",                          state: "Kuala Lumpur" },
  { id: "lf-kl37", name: "Zul Rafique & Partners",             state: "Kuala Lumpur" },

  // ── Labuan ────────────────────────────────────────────────────────────────
  { id: "lf-lb1", name: "Hakem Arabi & Associates",            state: "Labuan" },
  { id: "lf-lb2", name: "Labuan Law Associates",               state: "Labuan" },
  { id: "lf-lb3", name: "Omar & Partners",                     state: "Labuan" },

  // ── Melaka ────────────────────────────────────────────────────────────────
  { id: "lf-ml1", name: "Gan Teik Chee & Ho",                  state: "Melaka" },
  { id: "lf-ml2", name: "Koh & Partners",                      state: "Melaka" },
  { id: "lf-ml3", name: "Lim & Yap",                           state: "Melaka" },
  { id: "lf-ml4", name: "Pillai & Pillai",                     state: "Melaka" },
  { id: "lf-ml5", name: "Tan, Lee & Yong",                     state: "Melaka" },

  // ── Negeri Sembilan ───────────────────────────────────────────────────────
  { id: "lf-ns1", name: "Ahmad Riza & Partners",               state: "Negeri Sembilan" },
  { id: "lf-ns2", name: "Lim Teck Lee & Co",                   state: "Negeri Sembilan" },
  { id: "lf-ns3", name: "Rajan & Co",                          state: "Negeri Sembilan" },
  { id: "lf-ns4", name: "Seremban Legal Chambers",             state: "Negeri Sembilan" },
  { id: "lf-ns5", name: "Thiyaga & Associates",                state: "Negeri Sembilan" },

  // ── Pahang ────────────────────────────────────────────────────────────────
  { id: "lf-ph1", name: "Ahmad Ismail & Co",                   state: "Pahang" },
  { id: "lf-ph2", name: "Chong & Associates",                  state: "Pahang" },
  { id: "lf-ph3", name: "Hassan & Associates",                 state: "Pahang" },
  { id: "lf-ph4", name: "Kuantan Law Chambers",                state: "Pahang" },
  { id: "lf-ph5", name: "Nor Aini & Co",                       state: "Pahang" },

  // ── Perak ─────────────────────────────────────────────────────────────────
  { id: "lf-pk1", name: "David Lim & Partners",                state: "Perak" },
  { id: "lf-pk2", name: "Francis Ng & Co",                     state: "Perak" },
  { id: "lf-pk3", name: "Harpal Singh & Co",                   state: "Perak" },
  { id: "lf-pk4", name: "Khoo, Goh & Tan",                     state: "Perak" },
  { id: "lf-pk5", name: "Leong & Loo",                         state: "Perak" },
  { id: "lf-pk6", name: "Shan & Co",                           state: "Perak" },

  // ── Perlis ────────────────────────────────────────────────────────────────
  { id: "lf-ps1", name: "Arshad & Co",                         state: "Perlis" },
  { id: "lf-ps2", name: "Kangar Legal Associates",             state: "Perlis" },
  { id: "lf-ps3", name: "Malik & Partners",                    state: "Perlis" },

  // ── Pulau Pinang ──────────────────────────────────────────────────────────
  { id: "lf-pp1", name: "BC Tan & Lim",                        state: "Pulau Pinang" },
  { id: "lf-pp2", name: "Cheah Teh & Su",                      state: "Pulau Pinang" },
  { id: "lf-pp3", name: "Ling & Wong",                         state: "Pulau Pinang" },
  { id: "lf-pp4", name: "Naina Rajah & Syazwani",              state: "Pulau Pinang" },
  { id: "lf-pp5", name: "Ong Eu Leong & Kang",                 state: "Pulau Pinang" },
  { id: "lf-pp6", name: "Penang Legal Group",                  state: "Pulau Pinang" },
  { id: "lf-pp7", name: "Presgrave & Matthews",                state: "Pulau Pinang" },
  { id: "lf-pp8", name: "Straits Law Practice",                state: "Pulau Pinang" },

  // ── Putrajaya ─────────────────────────────────────────────────────────────
  { id: "lf-py1", name: "Presint Legal Associates",            state: "Putrajaya" },
  { id: "lf-py2", name: "Putrajaya Law Chambers",              state: "Putrajaya" },

  // ── Sabah ─────────────────────────────────────────────────────────────────
  { id: "lf-sb1", name: "Chong, Lin & Co",                     state: "Sabah" },
  { id: "lf-sb2", name: "Isaac Ignatius Raj & Co",             state: "Sabah" },
  { id: "lf-sb3", name: "Shim, Pang & Co",                     state: "Sabah" },
  { id: "lf-sb4", name: "Toh & Co",                            state: "Sabah" },
  { id: "lf-sb5", name: "Yee & Co",                            state: "Sabah" },

  // ── Sarawak ───────────────────────────────────────────────────────────────
  { id: "lf-sr1", name: "Abang Adi & Co",                      state: "Sarawak" },
  { id: "lf-sr2", name: "Kuching Law Associates",              state: "Sarawak" },
  { id: "lf-sr3", name: "Reddi & Co",                          state: "Sarawak" },
  { id: "lf-sr4", name: "Rosli Dahlan Saravana Partnership",   state: "Sarawak" },
  { id: "lf-sr5", name: "Tan & Chin",                          state: "Sarawak" },

  // ── Selangor ──────────────────────────────────────────────────────────────
  { id: "lf-sg01", name: "Afif Rahman & Chong",                state: "Selangor" },
  { id: "lf-sg02", name: "Bryan & Co",                         state: "Selangor" },
  { id: "lf-sg03", name: "Koh & Leong",                        state: "Selangor" },
  { id: "lf-sg04", name: "Kuek, Ong & Associates",             state: "Selangor" },
  { id: "lf-sg05", name: "Lim Kian Leong & Co",                state: "Selangor" },
  { id: "lf-sg06", name: "Low & Partners",                     state: "Selangor" },
  { id: "lf-sg07", name: "Sim & Rahman",                       state: "Selangor" },
  { id: "lf-sg08", name: "Tan Norizan & Associates",           state: "Selangor" },
  { id: "lf-sg09", name: "VGCLaw",                             state: "Selangor" },
  { id: "lf-sg10", name: "Wong & Yeong",                       state: "Selangor" },

  // ── Terengganu ────────────────────────────────────────────────────────────
  { id: "lf-tr1", name: "Abdul Rahim & Co",                    state: "Terengganu" },
  { id: "lf-tr2", name: "Engku Ahmad & Partners",              state: "Terengganu" },
  { id: "lf-tr3", name: "Hashim Wan & Co",                     state: "Terengganu" },
  { id: "lf-tr4", name: "Mustafa & Associates",                state: "Terengganu" },
];
