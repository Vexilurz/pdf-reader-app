import * as React from 'react';

export interface ITextItemChunk {
  text: string;
  color: string;
  className: string;
  id: string | null;
}

export interface ITextItemProps {
  chunks: ITextItemChunk[];
}
export interface ITextItemState {}

export class TextItem extends React.Component<ITextItemProps, ITextItemState> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { chunks } = this.props;
    return (
      <span className="text-item">
        {chunks?.map((chunk, index) => {
          return (
            <span
              // className="text-item-chunk"
              key={`chunk${index}`}
              id={chunk?.id}
              className={chunk?.className}
              style={{
                color: chunk?.color,
                backgroundColor: chunk?.color,
              }}
            >
              {chunk?.text}
            </span>
          );
        })}
      </span>
    );
  }
}
