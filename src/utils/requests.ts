import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

axios.defaults.baseURL = 'https://lichess.org';

export function GET(options: AxiosRequestConfig): Promise<any> {
	options = Object.assign(options, {
		method: 'GET',
		timeout: 5000
	});
	let x = axios(options)
		.catch((e: AxiosError) => {
			console.error(e);
			throw e;
		});
	if (options.responseType === 'stream') return x;
	else return x.then((res) => res.data as any);
		
}

export function POST(options: AxiosRequestConfig): Promise<any> {
	options = Object.assign(options, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	});
	return axios(options)
		.then((res: AxiosResponse<any>) => res.data)
		.catch((e) => {
			throw e;
		});
}