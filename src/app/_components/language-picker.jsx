'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export default function LanguageSelect() {
    const router = useRouter();

    function handleChange(e) {
        const selection = e.target.getAttribute('value');
        console.log(selection);
        router.push(`/${selection}`);
    }

    return (
        <Autocomplete
            id="language-select"
            sx={{ width: 300, margin: '1rem' }}
            options={languages}
            autoHighlight
            getOptionLabel={(option) => option.label}
            renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                    <Box
                        key={key}
                        component="li"
                        sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                        {...optionProps}
                        value={option.langCode}
                    >
                        <img
                            loading="lazy"
                            width="20"
                            srcSet={`https://flagcdn.com/w40/${option.flagCode.toLowerCase()}.png 2x`}
                            src={`https://flagcdn.com/w20/${option.flagCode.toLowerCase()}.png`}
                            alt=""
                        />
                        {option.label} ({option.langCode})
                    </Box>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Choose a language"
                    slotProps={{
                        htmlInput: {
                            ...params.inputProps,
                            autoComplete: 'new-password', // disable autocomplete and autofill
                        },
                    }}
                />
            )}
            onChange={handleChange}
        />
    );
}

const languages = [
    // { flagCode: 'AD', langCode: '', label: 'Andorra' },
    // { flagCode: 'AE', langCode: '', label: 'United Arab Emirates' },
    // { flagCode: 'AF', langCode: '', label: 'Afghanistan' },
    // { flagCode: 'AG', langCode: '', label: 'Antigua and Barbuda' },
    // { flagCode: 'AI', langCode: '', label: 'Anguilla' },
    // { flagCode: 'AL', langCode: '', label: 'Albania' },
    // { flagCode: 'AM', langCode: '', label: 'Armenia' },
    // { flagCode: 'AO', langCode: '', label: 'Angola' },
    // { flagCode: 'AQ', langCode: '', label: 'Antarctica' },
    // { flagCode: 'AR', langCode: '', label: 'Argentina' },
    // { flagCode: 'AS', langCode: '', label: 'American Samoa' },
    // { flagCode: 'AT', langCode: '', label: 'Austria' },
    // { flagCode: 'AU', langCode: '', label: 'Australia' },
    // { flagCode: 'AW', langCode: '', label: 'Aruba' },
    // { flagCode: 'AX', langCode: '', label: 'Alland Islands' },
    // { flagCode: 'AZ', langCode: '', label: 'Azerbaijan' },
    // { flagCode: 'BA', langCode: '', label: 'Bosnia and Herzegovina' },
    // { flagCode: 'BB', langCode: '', label: 'Barbados' },
    // { flagCode: 'BD', langCode: '', label: 'Bangladesh' },
    // { flagCode: 'BE', langCode: '', label: 'Belgium' },
    // { flagCode: 'BF', langCode: '', label: 'Burkina Faso' },
    // { flagCode: 'BG', langCode: '', label: 'Bulgaria' },
    // { flagCode: 'BH', langCode: '', label: 'Bahrain' },
    // { flagCode: 'BI', langCode: '', label: 'Burundi' },
    // { flagCode: 'BJ', langCode: '', label: 'Benin' },
    // { flagCode: 'BL', langCode: '', label: 'Saint Barthelemy' },
    // { flagCode: 'BM', langCode: '', label: 'Bermuda' },
    // { flagCode: 'BN', langCode: '', label: 'Brunei Darussalam' },
    // { flagCode: 'BO', langCode: '', label: 'Bolivia' },
    // { flagCode: 'BR', langCode: '', label: 'Brazil' },
    // { flagCode: 'BS', langCode: '', label: 'Bahamas' },
    // { flagCode: 'BT', langCode: '', label: 'Bhutan' },
    // { flagCode: 'BV', langCode: '', label: 'Bouvet Island' },
    // { flagCode: 'BW', langCode: '', label: 'Botswana' },
    // { flagCode: 'BY', langCode: '', label: 'Belarus' },
    // { flagCode: 'BZ', langCode: '', label: 'Belize' },
    // { flagCode: 'CA', langCode: '', label: 'Canada' },
    // { flagCode: 'CC', langCode: '', label: 'Cocos (Keeling) Islands' },
    // { flagCode: 'CD', langCode: '', label: 'Congo, Democratic Republic of the' },
    // { flagCode: 'CF', langCode: '', label: 'Central African Republic' },
    // { flagCode: 'CG', langCode: '', label: 'Congo, Republic of the' },
    // { flagCode: 'CH', langCode: '', label: 'Switzerland' },
    // { flagCode: 'CI', langCode: '', label: "Cote d'Ivoire" },
    // { flagCode: 'CK', langCode: '', label: 'Cook Islands' },
    // { flagCode: 'CL', langCode: '', label: 'Chile' },
    // { flagCode: 'CM', langCode: '', label: 'Cameroon' },
    // { flagCode: 'CN', langCode: '', label: 'China' },
    // { flagCode: 'CO', langCode: '', label: 'Colombia' },
    // { flagCode: 'CR', langCode: '', label: 'Costa Rica' },
    // { flagCode: 'CU', langCode: '', label: 'Cuba' },
    // { flagCode: 'CV', langCode: '', label: 'Cape Verde' },
    // { flagCode: 'CW', langCode: '', label: 'Curacao' },
    // { flagCode: 'CX', langCode: '', label: 'Christmas Island' },
    // { flagCode: 'CY', langCode: '', label: 'Cyprus' },
    // { flagCode: 'CZ', langCode: '', label: 'Czech Republic' },
    // { flagCode: 'DE', langCode: '', label: 'Germany' },
    // { flagCode: 'DJ', langCode: '', label: 'Djibouti' },
    // { flagCode: 'DK', langCode: '', label: 'Denmark' },
    // { flagCode: 'DM', langCode: '', label: 'Dominica' },
    // { flagCode: 'DO', langCode: '', label: 'Dominican Republic' },
    // { flagCode: 'DZ', langCode: '', label: 'Algeria' },
    // { flagCode: 'EC', langCode: '', label: 'Ecuador' },
    // { flagCode: 'EE', langCode: '', label: 'Estonia' },
    // { flagCode: 'EG', langCode: '', label: 'Egypt' },
    // { flagCode: 'EH', langCode: '', label: 'Western Sahara' },
    // { flagCode: 'ER', langCode: '', label: 'Eritrea' },
    { flagCode: 'ES', langCode: 'es-ES', label: 'Spanish' },
    // { flagCode: 'ET', langCode: '', label: 'Ethiopia' },
    // { flagCode: 'FI', langCode: '', label: 'Finland' },
    // { flagCode: 'FJ', langCode: '', label: 'Fiji' },
    // { flagCode: 'FK', langCode: '', label: 'Falkland Islands (Malvinas)' },
    // { flagCode: 'FM', langCode: '', label: 'Micronesia, Federated States of' },
    // { flagCode: 'FO', langCode: '', label: 'Faroe Islands' },
    // { flagCode: 'FR', langCode: '', label: 'France' },
    // { flagCode: 'GA', langCode: '', label: 'Gabon' },
    // { flagCode: 'GB', langCode: '', label: 'United Kingdom' },
    // { flagCode: 'GD', langCode: '', label: 'Grenada' },
    // { flagCode: 'GE', langCode: '', label: 'Georgia' },
    // { flagCode: 'GF', langCode: '', label: 'French Guiana' },
    // { flagCode: 'GG', langCode: '', label: 'Guernsey' },
    // { flagCode: 'GH', langCode: '', label: 'Ghana' },
    // { flagCode: 'GI', langCode: '', label: 'Gibraltar' },
    // { flagCode: 'GL', langCode: '', label: 'Greenland' },
    // { flagCode: 'GM', langCode: '', label: 'Gambia' },
    // { flagCode: 'GN', langCode: '', label: 'Guinea' },
    // { flagCode: 'GP', langCode: '', label: 'Guadeloupe' },
    // { flagCode: 'GQ', langCode: '', label: 'Equatorial Guinea' },
    // { flagCode: 'GR', langCode: '', label: 'Greece' },
    // { flagCode: 'GS', langCode: '', label: 'South Georgia and the South Sandwich Islands' },
    // { flagCode: 'GT', langCode: '', label: 'Guatemala' },
    // { flagCode: 'GU', langCode: '', label: 'Guam' },
    // { flagCode: 'GW', langCode: '', label: 'Guinea-Bissau' },
    // { flagCode: 'GY', langCode: '', label: 'Guyana' },
    // { flagCode: 'HK', langCode: '', label: 'Hong Kong' },
    // { flagCode: 'HM', langCode: '', label: 'Heard Island and McDonald Islands' },
    // { flagCode: 'HN', langCode: '', label: 'Honduras' },
    // { flagCode: 'HR', langCode: '', label: 'Croatia' },
    // { flagCode: 'HT', langCode: '', label: 'Haiti' },
    // { flagCode: 'HU', langCode: '', label: 'Hungary' },
    // { flagCode: 'ID', langCode: '', label: 'Indonesia' },
    // { flagCode: 'IE', langCode: '', label: 'Ireland' },
    // { flagCode: 'IL', langCode: '', label: 'Israel' },
    // { flagCode: 'IM', langCode: '', label: 'Isle of Man' },
    // { flagCode: 'IN', langCode: '', label: 'India' },
    // { flagCode: 'IO', langCode: '', label: 'British Indian Ocean Territory' },
    // { flagCode: 'IQ', langCode: '', label: 'Iraq' },
    // { flagCode: 'IR', langCode: '', label: 'Iran, Islamic Republic of' },
    // { flagCode: 'IS', langCode: '', label: 'Iceland' },
    // { flagCode: 'IT', langCode: '', label: 'Italy' },
    // { flagCode: 'JE', langCode: '', label: 'Jersey' },
    // { flagCode: 'JM', langCode: '', label: 'Jamaica' },
    // { flagCode: 'JO', langCode: '', label: 'Jordan' },
    // { flagCode: 'JP', langCode: '', label: 'Japan' },
    // { flagCode: 'KE', langCode: '', label: 'Kenya' },
    // { flagCode: 'KG', langCode: '', label: 'Kyrgyzstan' },
    // { flagCode: 'KH', langCode: '', label: 'Cambodia' },
    // { flagCode: 'KI', langCode: '', label: 'Kiribati' },
    // { flagCode: 'KM', langCode: '', label: 'Comoros' },
    // { flagCode: 'KN', langCode: '', label: 'Saint Kitts and Nevis' },
    // { flagCode: 'KP', langCode: '', label: "Korea, Democratic People's Republic of" },
    // { flagCode: 'KR', langCode: '', label: 'Korea, Republic of' },
    // { flagCode: 'KW', langCode: '', label: 'Kuwait' },
    // { flagCode: 'KY', langCode: '', label: 'Cayman Islands' },
    // { flagCode: 'KZ', langCode: '', label: 'Kazakhstan' },
    // { flagCode: 'LA', langCode: '', label: "Lao People's Democratic Republic" },
    // { flagCode: 'LB', langCode: '', label: 'Lebanon' },
    // { flagCode: 'LC', langCode: '', label: 'Saint Lucia' },
    // { flagCode: 'LI', langCode: '', label: 'Liechtenstein' },
    // { flagCode: 'LK', langCode: '', label: 'Sri Lanka' },
    // { flagCode: 'LR', langCode: '', label: 'Liberia' },
    // { flagCode: 'LS', langCode: '', label: 'Lesotho' },
    // { flagCode: 'LT', langCode: '', label: 'Lithuania' },
    // { flagCode: 'LU', langCode: '', label: 'Luxembourg' },
    // { flagCode: 'LV', langCode: '', label: 'Latvia' },
    // { flagCode: 'LY', langCode: '', label: 'Libya' },
    // { flagCode: 'MA', langCode: '', label: 'Morocco' },
    // { flagCode: 'MC', langCode: '', label: 'Monaco' },
    // { flagCode: 'MD', langCode: '', label: 'Moldova, Republic of' },
    // { flagCode: 'ME', langCode: '', label: 'Montenegro' },
    // { flagCode: 'MF', langCode: '', label: 'Saint Martin (French part)' },
    // { flagCode: 'MG', langCode: '', label: 'Madagascar' },
    // { flagCode: 'MH', langCode: '', label: 'Marshall Islands' },
    // { flagCode: 'MK', langCode: '', label: 'Macedonia, the Former Yugoslav Republic of' },
    // { flagCode: 'ML', langCode: '', label: 'Mali' },
    // { flagCode: 'MM', langCode: '', label: 'Myanmar' },
    // { flagCode: 'MN', langCode: '', label: 'Mongolia' },
    // { flagCode: 'MO', langCode: '', label: 'Macao' },
    // { flagCode: 'MP', langCode: '', label: 'Northern Mariana Islands' },
    // { flagCode: 'MQ', langCode: '', label: 'Martinique' },
    // { flagCode: 'MR', langCode: '', label: 'Mauritania' },
    // { flagCode: 'MS', langCode: '', label: 'Montserrat' },
    // { flagCode: 'MT', langCode: '', label: 'Malta' },
    // { flagCode: 'MU', langCode: '', label: 'Mauritius' },
    // { flagCode: 'MV', langCode: '', label: 'Maldives' },
    // { flagCode: 'MW', langCode: '', label: 'Malawi' },
    // { flagCode: 'MX', langCode: '', label: 'Mexico' },
    // { flagCode: 'MY', langCode: '', label: 'Malaysia' },
    // { flagCode: 'MZ', langCode: '', label: 'Mozambique' },
    // { flagCode: 'NA', langCode: '', label: 'Namibia' },
    // { flagCode: 'NC', langCode: '', label: 'New Caledonia' },
    // { flagCode: 'NE', langCode: '', label: 'Niger' },
    // { flagCode: 'NF', langCode: '', label: 'Norfolk Island' },
    // { flagCode: 'NG', langCode: '', label: 'Nigeria' },
    // { flagCode: 'NI', langCode: '', label: 'Nicaragua' },
    // { flagCode: 'NL', langCode: '', label: 'Netherlands' },
    // { flagCode: 'NO', langCode: '', label: 'Norway' },
    // { flagCode: 'NP', langCode: '', label: 'Nepal' },
    // { flagCode: 'NR', langCode: '', label: 'Nauru' },
    // { flagCode: 'NU', langCode: '', label: 'Niue' },
    // { flagCode: 'NZ', langCode: '', label: 'New Zealand' },
    // { flagCode: 'OM', langCode: '', label: 'Oman' },
    // { flagCode: 'PA', langCode: '', label: 'Panama' },
    // { flagCode: 'PE', langCode: '', label: 'Peru' },
    // { flagCode: 'PF', langCode: '', label: 'French Polynesia' },
    // { flagCode: 'PG', langCode: '', label: 'Papua New Guinea' },
    // { flagCode: 'PH', langCode: '', label: 'Philippines' },
    // { flagCode: 'PK', langCode: '', label: 'Pakistan' },
    // { flagCode: 'PL', langCode: '', label: 'Poland' },
    // { flagCode: 'PM', langCode: '', label: 'Saint Pierre and Miquelon' },
    // { flagCode: 'PN', langCode: '', label: 'Pitcairn' },
    // { flagCode: 'PR', langCode: '', label: 'Puerto Rico' },
    // { flagCode: 'PS', langCode: '', label: 'Palestine, State of' },
    // { flagCode: 'PT', langCode: '', label: 'Portugal' },
    // { flagCode: 'PW', langCode: '', label: 'Palau' },
    // { flagCode: 'PY', langCode: '', label: 'Paraguay' },
    // { flagCode: 'QA', langCode: '', label: 'Qatar' },
    // { flagCode: 'RE', langCode: '', label: 'Reunion' },
    // { flagCode: 'RO', langCode: '', label: 'Romania' },
    // { flagCode: 'RS', langCode: '', label: 'Serbia' },
    // { flagCode: 'RU', langCode: '', label: 'Russian Federation' },
    // { flagCode: 'RW', langCode: '', label: 'Rwanda' },
    // { flagCode: 'SA', langCode: '', label: 'Saudi Arabia' },
    // { flagCode: 'SB', langCode: '', label: 'Solomon Islands' },
    // { flagCode: 'SC', langCode: '', label: 'Seychelles' },
    // { flagCode: 'SD', langCode: '', label: 'Sudan' },
    // { flagCode: 'SE', langCode: '', label: 'Sweden' },
    // { flagCode: 'SG', langCode: '', label: 'Singapore' },
    // { flagCode: 'SH', langCode: '', label: 'Saint Helena' },
    // { flagCode: 'SI', langCode: '', label: 'Slovenia' },
    // { flagCode: 'SJ', langCode: '', label: 'Svalbard and Jan Mayen' },
    // { flagCode: 'SK', langCode: '', label: 'Slovakia' },
    // { flagCode: 'SL', langCode: '', label: 'Sierra Leone' },
    // { flagCode: 'SM', langCode: '', label: 'San Marino' },
    // { flagCode: 'SN', langCode: '', label: 'Senegal' },
    // { flagCode: 'SO', langCode: '', label: 'Somalia' },
    // { flagCode: 'SR', langCode: '', label: 'Suriname' },
    // { flagCode: 'SS', langCode: '', label: 'South Sudan' },
    // { flagCode: 'ST', langCode: '', label: 'Sao Tome and Principe' },
    // { flagCode: 'SV', langCode: '', label: 'El Salvador' },
    // { flagCode: 'SX', langCode: '', label: 'Sint Maarten (Dutch part)' },
    // { flagCode: 'SY', langCode: '', label: 'Syrian Arab Republic' },
    // { flagCode: 'SZ', langCode: '', label: 'Swaziland' },
    // { flagCode: 'TC', langCode: '', label: 'Turks and Caicos Islands' },
    // { flagCode: 'TD', langCode: '', label: 'Chad' },
    // { flagCode: 'TF', langCode: '', label: 'French Southern Territories' },
    // { flagCode: 'TG', langCode: '', label: 'Togo' },
    // { flagCode: 'TH', langCode: '', label: 'Thailand' },
    // { flagCode: 'TJ', langCode: '', label: 'Tajikistan' },
    // { flagCode: 'TK', langCode: '', label: 'Tokelau' },
    // { flagCode: 'TL', langCode: '', label: 'Timor-Leste' },
    // { flagCode: 'TM', langCode: '', label: 'Turkmenistan' },
    // { flagCode: 'TN', langCode: '', label: 'Tunisia' },
    // { flagCode: 'TO', langCode: '', label: 'Tonga' },
    // { flagCode: 'TR', langCode: '', label: 'Turkey' },
    // { flagCode: 'TT', langCode: '', label: 'Trinidad and Tobago' },
    // { flagCode: 'TV', langCode: '', label: 'Tuvalu' },
    // { flagCode: 'TW', langCode: '', label: 'Taiwan' },
    // { flagCode: 'TZ', langCode: '', label: 'United Republic of Tanzania' },
    // { flagCode: 'UA', langCode: '', label: 'Ukraine' },
    // { flagCode: 'UG', langCode: '', label: 'Uganda' },
    { flagCode: 'US', langCode: 'en-US', label: 'English' },
    // { flagCode: 'UY', langCode: '', label: 'Uruguay' },
    // { flagCode: 'UZ', langCode: '', label: 'Uzbekistan' },
    // { flagCode: 'VA', langCode: '', label: 'Holy See (Vatican City State)' },
    // { flagCode: 'VC', langCode: '', label: 'Saint Vincent and the Grenadines' },
    // { flagCode: 'VE', langCode: '', label: 'Venezuela' },
    // { flagCode: 'VG', langCode: '', label: 'British Virgin Islands' },
    // { flagCode: 'VI', langCode: '', label: 'US Virgin Islands' },
    // { flagCode: 'VN', langCode: '', label: 'Vietnam' },
    // { flagCode: 'VU', langCode: '', label: 'Vanuatu' },
    // { flagCode: 'WF', langCode: '', label: 'Wallis and Futuna' },
    // { flagCode: 'WS', langCode: '', label: 'Samoa' },
    // { flagCode: 'XK', langCode: '', label: 'Kosovo' },
    // { flagCode: 'YE', langCode: '', label: 'Yemen' },
    // { flagCode: 'YT', langCode: '', label: 'Mayotte' },
    // { flagCode: 'ZA', langCode: '', label: 'South Africa' },
    // { flagCode: 'ZM', langCode: '', label: 'Zambia' },
    // { flagCode: 'ZW', langCode: '', label: 'Zimbabwe' }
];