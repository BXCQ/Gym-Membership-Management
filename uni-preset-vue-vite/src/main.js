import { createApp } from 'vue'
import App from './App.vue'
import {
	Tabbar,
	TabbarItem,
	NoticeBar,
	Swipe,
	SwipeItem,
	PullRefresh,
	List,
	Form,
	Field,
	CellGroup,
	Cell,
	Button,
	Icon,
	Popup,
	DatePicker,
	Picker,
	Dialog
} from 'vant';
import 'vant/lib/index.css';
import './static/style/global.css';
import { isVNode } from 'vue'

const vantComponents = [
	Tabbar,
	TabbarItem,
	NoticeBar,
	Swipe,
	SwipeItem,
	PullRefresh,
	List,
	Form,
	Field,
	CellGroup,
	Cell,
	Button,
	Icon,
	Popup,
	DatePicker,
	Picker,
	Dialog
];

const app = createApp(App)

// 批量注册Vant组件
vantComponents.forEach(component => {
	app.use(component);
});

app.mount('#app')
