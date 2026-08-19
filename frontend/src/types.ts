export type Line = {
    timestamps: string[],
    closes: number[],
    changes: number[]
}

export type CandleStickGraph = {
    timestamps: string[]
    data: number[][]
    full_data: any
    changes: number[]
    min: number
    max: number
}
