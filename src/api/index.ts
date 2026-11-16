import { authApi, getPublic } from './common'

export { errorMessage } from './common'

// ===================== TYPES =====================

export interface AppVersion {
  version: string
}

export interface Instrument {
  id: string
  userId: string | null
  name: string
  frets: number
  tuning: number[]
  global: boolean
}

export interface InstrumentRequest {
  name: string
  frets: number
  tuning: number[]
  global?: boolean
}

export interface Mode {
  id: string
  userId: string | null
  name: string
  intervals: number[]
  global: boolean
}

export interface ModeRequest {
  name: string
  intervals: number[]
  global?: boolean
}

export interface Chord {
  id: string
  userId: string | null
  name: string
  intervals: number[]
  global: boolean
}

export interface ChordRequest {
  name: string
  intervals: number[]
  global?: boolean
}

export interface FretboardNote {
  fret: number
  midi: number
  note: string
}

export interface FretboardString {
  index: number
  openMidi: number
  openNote: string
  notes: FretboardNote[]
}

export interface FretboardGrid {
  frets: number
  strings: FretboardString[]
}

export interface FretboardPosition {
  string: number
  fret: number
  midi: number
  note: string
  degree: number
}

export interface Fingering {
  baseFret: number
  positions: FretboardPosition[]
}

export interface Fingerings {
  items: Fingering[]
  truncated: boolean
}

export interface ChordInMode {
  chordId: string
  chordName: string
  intervals: number[]
  global: boolean
  rootMidi: number
  rootNote: string
  degree: number
}

export interface ModeMatch {
  modeId: string
  modeName: string
  intervals: number[]
  global: boolean
  tonicPitchClass: number
  tonicNote: string
}

export interface ChordTonicRequest {
  chordId: string
  tonic: number
}

export interface FretboardQuery {
  instrumentId: string
  tonic: number
  span?: number
}

export interface ScaleQuery extends FretboardQuery {
  modeId: string
}

export interface ArpeggioQuery extends FretboardQuery {
  chordId: string
}

export interface ChordShapesQuery extends FretboardQuery {
  chordId: string
}

export const MIN_FRETS = 12
export const MAX_FRETS = 24
export const MIN_STRINGS = 3
export const MAX_STRINGS = 12
export const MIN_MIDI = 12
export const MAX_MIDI = 108
export const MIN_SPAN = 2
export const MAX_SPAN = 12

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function floorMod(value: number, mod: number): number {
  return ((value % mod) + mod) % mod
}

export function noteName(midi: number): string {
  return NOTE_NAMES[floorMod(midi, 12)]
}

export function pitchClassName(pitchClass: number): string {
  return NOTE_NAMES[floorMod(pitchClass, 12)]
}

/** Removes the octave suffix from a note name returned by the backend. */
export function noteLabel(note: string): string {
  return note.replace(/-?\d+$/, '')
}

// ===================== API =====================

export function getBackendVersion(): Promise<AppVersion> {
  return getPublic<AppVersion>('/version')
}

export function listInstruments(): Promise<Instrument[]> {
  return authApi.get<Instrument[]>('/instruments')
}

export function getInstrument(id: string): Promise<Instrument> {
  return authApi.get<Instrument>(`/instruments/${id}`)
}

export function createInstrument(request: InstrumentRequest): Promise<Instrument> {
  return authApi.post<Instrument>('/instruments', request)
}

export function updateInstrument(id: string, request: InstrumentRequest): Promise<void> {
  return authApi.put<void>(`/instruments/${id}`, request)
}

export function deleteInstrument(id: string): Promise<void> {
  return authApi.delete<void>(`/instruments/${id}`)
}

export function listModes(): Promise<Mode[]> {
  return authApi.get<Mode[]>('/modes')
}

export function getMode(id: string): Promise<Mode> {
  return authApi.get<Mode>(`/modes/${id}`)
}

export function createMode(request: ModeRequest): Promise<Mode> {
  return authApi.post<Mode>('/modes', request)
}

export function updateMode(id: string, request: ModeRequest): Promise<void> {
  return authApi.put<void>(`/modes/${id}`, request)
}

export function deleteMode(id: string): Promise<void> {
  return authApi.delete<void>(`/modes/${id}`)
}

export function listChords(): Promise<Chord[]> {
  return authApi.get<Chord[]>('/chords')
}

export function getChord(id: string): Promise<Chord> {
  return authApi.get<Chord>(`/chords/${id}`)
}

export function createChord(request: ChordRequest): Promise<Chord> {
  return authApi.post<Chord>('/chords', request)
}

export function updateChord(id: string, request: ChordRequest): Promise<void> {
  return authApi.put<void>(`/chords/${id}`, request)
}

export function deleteChord(id: string): Promise<void> {
  return authApi.delete<void>(`/chords/${id}`)
}

export function getFretboard(instrumentId: string): Promise<FretboardGrid> {
  return authApi.get<FretboardGrid>(`/fretboard/instruments/${instrumentId}`)
}

export function getScales(query: ScaleQuery): Promise<Fingerings> {
  return authApi.get<Fingerings>('/fretboard/scales', query)
}

export function getArpeggios(query: ArpeggioQuery): Promise<Fingerings> {
  return authApi.get<Fingerings>('/fretboard/arpeggios', query)
}

export function getChordShapes(query: ChordShapesQuery): Promise<Fingerings> {
  return authApi.get<Fingerings>('/fretboard/chords', query)
}

export function getChordsInMode(modeId: string, tonic: number): Promise<ChordInMode[]> {
  return authApi.get<ChordInMode[]>('/matching/mode-chords', { modeId, tonic })
}

export function matchModes(chords: ChordTonicRequest[]): Promise<ModeMatch[]> {
  return authApi.post<ModeMatch[]>('/matching/modes', { chords })
}
