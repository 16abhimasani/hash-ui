import Router from 'next/router';
import NProgress from 'nprogress';
import React, { useEffect } from 'react';
import { useAppContext } from '../contexts/app';
import { BANNER_HEIGHT } from './header';

export interface MyProps {
  color: string;
  startPosition: number;
  stopDelayMs: number;
  height: number;
  options?: any;
}

export const NavigationLoadingProgressBar: React.FC<MyProps> = (props) => {
  const color = props.color;
  const height = props.height;

  const { isAppBannerVisible } = useAppContext();

  useEffect(() => {
    const routeChangeStart = () => {
      // console.log('start');
      NProgress.set(props.startPosition);
      NProgress.start();
    };

    let timer: any;
    const routeChangeEnd = () => {
      // console.log('end');
      clearTimeout(timer);
      timer = setTimeout(() => {
        NProgress.done(true);
      }, props.stopDelayMs);
    };

    if (props.options) {
      NProgress.configure(props.options);
    }

    Router.events.on('routeChangeStart', routeChangeStart);
    Router.events.on('routeChangeComplete', routeChangeEnd);
    Router.events.on('routeChangeError', routeChangeEnd);
    return () => {
      Router.events.off('routeChangeStart', routeChangeStart);
      Router.events.off('routeChangeComplete', routeChangeEnd);
      Router.events.off('routeChangeError', routeChangeEnd);
    };
  }, [props.options, props.startPosition, props.stopDelayMs]);

  return (
    <style jsx global>{`
      #nprogress {
        pointer-events: none;
      }
      #nprogress .bar {
        background: ${color};
        position: fixed;
        z-index: 1030;
        top: calc(0px + ${false ? BANNER_HEIGHT : '0px'});
        left: 0;
        width: 100%;
        height: ${height}px;
      }
      #nprogress .peg {
        display: block;
        position: absolute;
        right: 0px;
        width: 100px;
        height: 100%;
        box-shadow: 0 0 10px ${color}, 0 0 5px ${color};
        opacity: 1;
        -webkit-transform: rotate(3deg) translate(0px, -4px);
        -ms-transform: rotate(3deg) translate(0px, -4px);
        transform: rotate(3deg) translate(0px, -4px);
      }
      #nprogress .spinner {
        display: none;
        position: fixed;
        z-index: 1031;
        top: ${false ? `calc(15px + ${BANNER_HEIGHT})` : '15px'};
        right: 15px;
      }
      #nprogress .spinner-icon {
        width: 18px;
        height: 18px;
        box-sizing: border-box;
        border: solid 2px transparent;
        border-top-color: ${color};
        border-left-color: ${color};
        border-radius: 50%;
        -webkit-animation: nprogresss-spinner 400ms linear infinite;
        animation: nprogress-spinner 400ms linear infinite;
      }
      .nprogress-custom-parent {
        overflow: hidden;
        position: relative;
      }
      .nprogress-custom-parent #nprogress .spinner,
      .nprogress-custom-parent #nprogress .bar {
        position: absolute;
      }
      @-webkit-keyframes nprogress-spinner {
        0% {
          -webkit-transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
        }
      }
      @keyframes nprogress-spinner {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}</style>
  );
};
