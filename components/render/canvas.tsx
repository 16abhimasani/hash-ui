import { ArtFactory, ArtFactoryCanvas, ArtFactorySvg } from '@hash/seasons';
import { Bound } from '@hash/sketch-utils';
import { DIMENSIONS } from '@hash/types';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useRafLoop } from 'react-use';
import { SketchCanvas, StyledImg } from './common';

interface CanvasRendererProps {
  prerenderPayload: any;
  onHasDrawn?: () => void;
  shouldEnableRAFLoop?: boolean;
  artFactory: ArtFactoryCanvas<any, any>;
  dimensions: Bound;
}

const UnMemoizedCanvasRenderer: FC<CanvasRendererProps> = ({
  shouldEnableRAFLoop,
  onHasDrawn,
  prerenderPayload,
  dimensions,
  artFactory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sketcherRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    canvasRef.current.width = dimensions[0];
    canvasRef.current.height = dimensions[1];
    const ctx = canvasRef.current.getContext(
      artFactory.sketchCanvasContextType,
    );

    const sketchContext = {
      ctx,
      width: dimensions[0],
      height: dimensions[1],
    };

    const sketcher = artFactory.sketch(
      sketchContext,
      prerenderPayload.data,
      prerenderPayload.gene,
    );

    sketcherRef.current = sketcher;
  }, [canvasRef]);

  const [stopLoop, startLoop, isLoopActive] = useRafLoop(() => {
    if (!!sketcherRef.current) {
      const sketcher = sketcherRef.current;
      sketcher.render();
    }
  });

  useEffect(() => {
    if (shouldEnableRAFLoop && !isLoopActive()) {
      startLoop();
    } else if (!shouldEnableRAFLoop && isLoopActive()) {
      stopLoop();
    }
  }, [shouldEnableRAFLoop]);

  console.log('t');
  useEffect(() => {
    if (!sketcherRef.current) {
      return;
    }

    onHasDrawn?.();
    const sketcher = sketcherRef.current;

    sketcher.render();

    return () => {
      sketcher.end();
    };
  }, [onHasDrawn, sketcherRef, prerenderPayload]);

  return <SketchCanvas ref={canvasRef} />;
};

interface SvgRendererProps {
  prerenderPayload: any;
  onHasDrawn?: () => void;
  artFactory: ArtFactorySvg<any, any>;
  dimensions: Bound;
}

const UnMemoizedSvgRenderer: FC<SvgRendererProps> = ({
  onHasDrawn,
  prerenderPayload,
  dimensions,
  artFactory,
}) => {
  const [svgData, setSvgData] = useState<string | undefined>(undefined);

  useEffect(() => {
    onHasDrawn?.();
    const svgStr = artFactory.sketch(
      { width: DIMENSIONS[0], height: DIMENSIONS[1] },
      prerenderPayload.data,
      prerenderPayload.gene,
    );
    setSvgData(`data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`);
  }, [onHasDrawn, artFactory, prerenderPayload]);

  if (!svgData) {
    return null;
  }

  return <StyledImg src={svgData} />;
};

const CanvasRenderer = React.memo(UnMemoizedCanvasRenderer);
const SvgRenderer = React.memo(UnMemoizedSvgRenderer);

interface CanvasProps {
  prerenderPayload: any;
  onHasDrawn?: () => void;
  shouldEnableRAFLoop?: boolean;
  artFactory: ArtFactory<any, any>;
  dimensions: Bound;
}

export const Canvas: FC<CanvasProps> = (props) => {
  if (props.artFactory.sketchCanvasContextType === 'svg') {
    return <SvgRenderer {...(props as any)} />;
  }
  return <CanvasRenderer {...(props as any)} />;
};
