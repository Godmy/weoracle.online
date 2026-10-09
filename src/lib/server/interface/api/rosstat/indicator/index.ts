export interface RosstatIndicator {
	id: string;
	title: string;
	source: 'fedstat' | 'rosstat-opendata' | 'rosstat-file';
	url: string;
	description?: string;
	filters?: string[];
	tags?: string[];
}
