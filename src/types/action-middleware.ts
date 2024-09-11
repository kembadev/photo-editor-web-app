import { type IMAGE_BYTES_ACTION_TYPES, type ReducerAction } from '../reducer-like/ImageBytes.ts'

type PayloadOf<T, U> = T extends { type: U; payload?: infer A }
    ? A
    : never

export type GetPayload<T extends IMAGE_BYTES_ACTION_TYPES> = PayloadOf<ReducerAction, T>

type Payload<T extends IMAGE_BYTES_ACTION_TYPES> = GetPayload<T> extends never
    ? undefined
    : GetPayload<T> extends object
        ? GetPayload<T> | [UIPayload: GetPayload<T>, OffscreenPayload: GetPayload<T>]
        : undefined

type ActionBase<T extends IMAGE_BYTES_ACTION_TYPES> = { type: T }

export type Action<T extends IMAGE_BYTES_ACTION_TYPES> = Payload<T> extends undefined
    ? ActionBase<T> & { payload?: undefined }
    : ActionBase<T> & { payload: Payload<T> }
