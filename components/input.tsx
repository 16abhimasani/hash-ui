import {
  ListboxButton,
  ListboxInput,
  ListboxList,
  ListboxPopover,
} from '@reach/listbox';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { maybePluralizeWord } from '../utils/words';
import { Flex, FlexCenterColumn, FlexEnds } from './flex';

export const TextInput = styled.input.attrs({ type: 'text' })`
  font-size: 14px;
  background: none;
  border: none;
  border-radius: none;
  outline: none;
  overflow: hidden;
  flex-grow: 1;
  ::placeholder {
    color: black;
    opacity: 0.3;
  }
`;

export const TitleInput = styled.input.attrs({ type: 'text' })`
  font-size: 40px;
  line-height: 46px;
  background: none;
  border: none;
  border-radius: none;
  outline: none;
  overflow: hidden;
  flex-grow: 1;
  ::placeholder {
    color: black;
    opacity: 0.3;
  }
`;

export const FormLabel = styled.p`
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 18px;
  margin: 0;
`;

export const FormAdditiveLabel = styled.p`
  font-family: Helvetica;
  font-style: normal;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.5);
  margin: 0;
`;

export const FormLabelRow = styled(FlexEnds)`
  padding-bottom: 16px;
`;

export const FormContainer = styled.div``;

export const FormGroupContainer = styled.div`
  > ${FormContainer} + ${FormContainer} {
    margin-top: 32px;
  }
`;

export const NumberInput = styled.input.attrs({ type: 'number' })`
  font-size: 30px;
  background: none;
  border: none;
  border-radius: none;
  outline: none;
  overflow: hidden;
  flex-grow: 1;
  ::placeholder {
    color: black;
    opacity: 0.3;
  }
`;

export const RangeInput = styled.input.attrs({ type: 'range' })`
  background: black;
  height: 2px;
  border-radius: 2px;
  margin: 0;
  width: 100%;
  appearance: none;

  &::-webkit-slider-thumb {
    position: relative;
    appearance: none;
    height: 24px;
    width: 24px;
    border: 2px solid black;
    border-radius: 100%;
    background: url('/icons/knob.svg') no-repeat;
    background-position: center;
  }
  &::-moz-range-thumb {
    position: relative;
    appearance: none;
    height: 24px;
    width: 24px;
    background: white;
    border: 2px solid black;
    border-radius: 100%;
    background: url('/icons/knob.svg') no-repeat;
    background-position: center;
  }
  &::-ms-thumb {
    position: relative;
    appearance: none;
    height: 24px;
    width: 24px;
    background: white;
    border: 2px solid black;
    border-radius: 100%;
    background: url('/icons/knob.svg') no-repeat;
    background-position: center;
  }
`;

const NumDaysInputContainer = styled.div`
  width: 100%;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 20px;
`;

const NumDaysRangeLabel = styled.p`
  padding: 0;
  margin: 0;
  font-weight: bold;
  font-size: 18px;
  line-height: 24px;
`;

const NumDaysRangeTitle = styled.p`
  padding: 0;
  margin: 0;
  font-size: 20px;
  line-height: 20px;
  color: rgba(0, 0, 0, 1);
  padding-bottom: 16px;
`;

export const DEFAULT_NUM_DAYS = 5;

export const NumDaysRangeInput: FC<{
  actionText?: string;
  onChange?: (n: number) => void;
}> = ({ actionText, onChange }) => {
  const [numDays, setNumDays] = useState(DEFAULT_NUM_DAYS);

  const handleChange = useCallback((e: any) => {
    setNumDays(e.target.value);
  }, []);

  useEffect(() => {
    onChange?.(numDays);
  }, [onChange, numDays]);

  const timeUnit = useMemo(() => {
    return 'day';
  }, [numDays]);

  const timeAmount = useMemo(() => {
    return numDays;
  }, [numDays]);

  return (
    <NumDaysInputContainer>
      <FlexCenterColumn>
        <NumDaysRangeTitle>
          {actionText ? `${actionText} ` : ''}
          <strong>
            {timeAmount} {maybePluralizeWord(timeUnit, timeAmount)}
          </strong>
        </NumDaysRangeTitle>
      </FlexCenterColumn>
      <FlexEnds style={{ marginTop: 4 }}>
        <NumDaysRangeLabel>1</NumDaysRangeLabel>
        <RangeInput
          onChange={handleChange}
          min="1"
          max="32"
          step="1"
          value={numDays}
          style={{ margin: '0 16px' }}
        />
        <NumDaysRangeLabel>32</NumDaysRangeLabel>
      </FlexEnds>
    </NumDaysInputContainer>
  );
};

export const TextInputContainer = styled(Flex)`
  padding: 16px 24px;
  background: #f0efef;
  border-radius: 8px;
`;
export const TextInputContainerRow = styled(TextInputContainer)`
  width: 100%;
  > ${TextInput} {
    flex-grow: 1;
  }
`;

export const SelectInput = styled(ListboxInput)``;

export const SelectInputButton = styled(ListboxButton)`
  display: flex;
  width: 100%;
  position: relative;
  padding: 8px 14px;
  font-size: 16px;
  line-height: 18px;
  background: white;
  border-radius: 999px;
  width: 100%;
  outline: none;
  font-weight: bold;
  display: flex;
  align-items: center;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.25);
  ::after {
    content: '';
    width: 14px;
    height: 14px;
    background-size: 14px 14px;
    margin-left: 6px;
    background-image: url('/icons/dropdown-arrow.svg');
  }
  &[aria-expanded='true'] {
    ::after {
      transform: rotate(180deg);
    }
  }
`;

export const SelectInputPopover = styled(ListboxPopover)`
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 4px;
  margin-top: 8px;
  border-radius: 8px;
  z-index: 1200;
  font-weight: bold;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.25);
`;

export const SelectInputList = styled(ListboxList)`
  padding: 0;
  margin: 0;
  list-style: none;
  outline: none;
  > li {
    padding: 8px;
    border-radius: 4px;
  }
  > li:hover {
    background: rgba(0, 0, 0, 0.075);
  }
`;
