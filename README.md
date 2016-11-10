1.需要nodejs环境，在本目录下命令行执行npm install安装依赖

2.把需要转换的vin从文件中拷贝出来，打开index转换为'vin字符串'

3.根据sql语句查询数据（必须要有car_code,longitude,latitude。其他字段看需求添加）

select car.car_code,gps.collect_Time,gps.receive_time,gps.mileage,gps.longitude,gps.latitude from rt_gps_data gps left join car_info car on gps.car_id=car.car_id where gps.car_id in(select car_id from car_info where car_code in('vin字符串'))

4.导出结果转换为excel文件放到xls文件夹中


5.在本目录命令行执行node index.js,完成后output里就是最终文件