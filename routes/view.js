// const express = require('express') //install express: Terminal (ประกาศใช้งาน express)
// const app = express() //เก็บตัว object ไว้ใน ตัวแปร app

// const router = express.Router
var express = require('express');
var router = express.Router();
// const mysql = require('mysql');
const session = require('express-session');
const mysql = require('mysql2/promise');



// const serviceAccount = require('./projectjop-86653-firebase-adminsdk-riay7-b1a0545395.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://projectjop-86653-default-rtdb.asia-southeast1.firebasedatabase.app'
// });

// const db_fb = admin.database();


router.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false
}));
const db = mysql.createPool({
  host: '119.59.96.62',
  user: 'drchanon',
  password: 'nonahcrd123',
  database: 'LAB_DB',
  port: '3306',
  waitForConnections: true,
  queueLimit: 0
});

const sessionChecker = (req, res, next) => {

  if (session.id_admin !== undefined) {
    // หากมีค่าตัวแปร session ชื่อ user ให้เรียกฟังก์ชั่น next()
    next();
  } else {
    // หากไม่มีค่าตัวแปร session ให้ render EJS ชื่อ login
    res.render('pages/login');
  }
};


//dashboard
router.get('/index', sessionChecker, async (req, res) => {
  try {
    if (session.branch == 0) {
      const [result] = await db.query(`SELECT count(*) as total_car FROM car_wash  where delete_time IS NULL`);
      const [result_price] = await db.query(`SELECT sum(price) as total_price FROM use_car_wash  where delete_time IS NULL`);
      const [result_pricemonth] = await db.query(`SELECT sum(price) as total_pricemonth FROM use_car_wash  
    join car_wash on use_car_wash.idcar_wash = car_wash.idcar_wash  
    where use_car_wash.delete_time IS NULL   
    and  month(use_car_wash.create_time)	 in 
    (SELECT MONTH(create_time) FROM use_car_wash 
    WHERE  MONTH(create_time) = MONTH(NOW())); `);
      const [result_dataadmin] = await db.query("SELECT * FROM admin  where  idadmin  = ?", [session.id_admin]);
      const [data_accident] = await db.query(`SELECT count(*) as  accident   
    FROM car_wash WHERE  status != 1 or status_water != 1 or status_wind != 1 or status_foam != 1 `);
      const [data_use] = await db.query(`SELECT count(*) as  usecar   
    FROM car_wash WHERE  status = 1 and status_water = 1 and status_wind = 1 and status_foam = 1 `);
      const [data_damaged] = await db.query(`SELECT count(*) as  damaged   
    FROM car_wash WHERE  status != 1 or status_water != 1 or status_wind != 1 or status_foam != 1`);

      await db.execute('SET @total := 0');
      const [result_chart_use_money] = await db.query(`
          SELECT HOUR(create_time) AS time, sum(price)  as running_total
          FROM use_car_wash 
          WHERE DAY(create_time) = DAY(NOW()) and  MONTH(create_time) = MONTH(NOW()) and  YEAR(create_time) = YEAR(NOW())
          AND delete_time IS NULL
          GROUP BY time
      `);
      // console.log(result_chart_use)
      let data_chart_total_money = [];
      result_chart_use_money.forEach((value) => {
        let txt_time = "";
        if ((value.time).toString().length == 1) {
          txt_time = 0 + (value.time).toString() + ":00"
        } else {
          txt_time = (value.time).toString()
        }
        let arr_value = [txt_time, parseInt(value.running_total)]
        console.log(arr_value)
        data_chart_total_money.push(arr_value)
      });
      console.log(data_chart_total_money)


      const [result_chart_use_group_sql] = await db.query(`
      SELECT use_car_wash.idcar_wash,count(use_car_wash.idcar_wash) as total_group_wash,branch.name_branch as name FROM use_car_wash 
      JOIN car_wash on use_car_wash.idcar_wash = car_wash.idcar_wash
      JOIN branch on car_wash.branch_id = branch.id_branch
      GROUP by use_car_wash.idcar_wash,branch.id_branch
      `);
      const [result_avg_money] = await db.query(` SELECT  avg(price)  as avg_total
      FROM use_car_wash 
      WHERE   MONTH(create_time) = MONTH(NOW()) and  YEAR(create_time) = YEAR(NOW())
      AND delete_time IS NULL`);
      // console.log(result_chart_use)
      let result_chart_use_group = [];
      result_chart_use_group_sql.forEach((value) => {
        let arr_value = [value.name.toString(), parseInt(value.total_group_wash)]
        console.log(arr_value)
        result_chart_use_group.push(arr_value)
      });
      console.log(result_chart_use_group)

      const [result_sum_withdraw] = await db.query(`SELECT sum(total)  as sum_withdraw FROM withdraw_money
    WHERE delete_time IS NULL and status  = 1 `);

      const [result_count_use] = await db.query(` SELECT  count(*)  as total
    FROM use_car_wash 
    WHERE   MONTH(create_time) = MONTH(NOW()) and  YEAR(create_time) = YEAR(NOW())
    AND delete_time IS NULL`);
      res.render('pages/dashboard', {
        branch: session.branch, data_count_carwash: result,
        result_price: result_price, data_damaged: data_damaged,
        result_dataadmin: result_dataadmin, result_pricemonth: result_pricemonth,
        data_use: data_use, data_accident: data_accident,
        result_sum_withdraw: result_sum_withdraw,
        result_avg_money: result_avg_money,
        result_count_use: result_count_use,
        data_chart_total_money: JSON.stringify(data_chart_total_money),
        result_chart_use_group: JSON.stringify(result_chart_use_group)
      });




    } else {
      const [result] = await db.query(`SELECT count(*) as total_car FROM car_wash  where delete_time IS NULL and branch_id	 = ?`, [session.branch]);
      const [result_price] = await db.query(`SELECT sum(price) as total_price FROM use_car_wash  
      join car_wash on use_car_wash.idcar_wash = car_wash.idcar_wash  
      where use_car_wash.delete_time IS NULL  and branch_id	 = ?`, [session.branch]);
      const [result_pricemonth] = await db.query(`SELECT sum(price) as total_pricemonth FROM use_car_wash  
    join car_wash on use_car_wash.idcar_wash = car_wash.idcar_wash  
    where use_car_wash.delete_time IS NULL   
    and  month(use_car_wash.create_time)	 in 
    (SELECT MONTH(create_time) FROM use_car_wash 
    WHERE  MONTH(create_time) = MONTH(NOW())) and branch_id	 = ?; `, [session.branch]);
      const [result_dataadmin] = await db.query("SELECT * FROM admin  where  idadmin  = ?", [session.id_admin]);
      const [data_accident] = await db.query(`SELECT count(*) as  accident   
    FROM car_wash  WHERE branch_id	 = ? and status != 1 or status_water != 1 or status_wind != 1 or status_foam != 1  `, [session.branch]);
      const [data_use] = await db.query(`SELECT count(*) as  usecar   
    FROM car_wash  WHERE branch_id	 = ? and  status = 1 and status_water = 1 and status_wind = 1 and status_foam = 1  `, [session.branch]);
      const [data_damaged] = await db.query(`SELECT count(*) as  damaged   
    FROM car_wash  WHERE branch_id	 = ? and status != 1 or status_water != 1 or status_wind != 1 or status_foam != 1 `, [session.branch]);

      await db.execute('SET @total := 0');
      const [result_chart_use] = await db.query(`
    SELECT HOUR(use_car_wash.create_time) as time, (@total := @total + price) AS running_total FROM use_car_wash 
    join car_wash on use_car_wash.idcar_wash = car_wash.idcar_wash
    WHERE DAY(use_car_wash.create_time) = DAY(NOW()) and MONTH(use_car_wash.create_time) = MONTH(NOW()) 
    and  YEAR(use_car_wash.create_time) = YEAR(NOW()) and use_car_wash.delete_time IS NULL 
    and car_wash.branch_id	 = ?
    `, [session.branch]);
      // console.log(result_chart_use)
      let data_chart_total_money = [];
      result_chart_use.forEach((value) => {
        let arr_value = [(value.time).toString(), parseInt(value.running_total)]
        console.log(arr_value)
        data_chart_total_money.push(arr_value)
      });
      console.log(data_chart_total_money)


      const [result_chart_use_group_sql] = await db.query(`
      SELECT use_car_wash.idcar_wash,count(use_car_wash.idcar_wash) as total_group_wash,branch.name_branch as name FROM use_car_wash 
      JOIN car_wash on use_car_wash.idcar_wash = car_wash.idcar_wash
      JOIN branch on car_wash.branch_id = branch.id_branch
      WHERE branch.id_branch = ?
      `, [session.branch]);
      const [result_avg_money] = await db.query(` SELECT  avg(price)  as avg_total
      FROM use_car_wash 
      LEFT JOIN car_wash ON
      use_car_wash.id_usecar = car_wash.idcar_wash
      WHERE   MONTH(use_car_wash.create_time) = MONTH(NOW()) and 
       YEAR(use_car_wash.create_time) = YEAR(NOW())
      AND use_car_wash.delete_time IS NULL
      and branch_id	 = ?
      `, [session.branch]);
      // console.log(result_chart_use)
      let result_chart_use_group = [];
      result_chart_use_group_sql.forEach((value) => {
        let arr_value = [value.name.toString(), parseInt(value.total_group_wash)]
        console.log(arr_value)
        result_chart_use_group.push(arr_value)
      });
      console.log(result_chart_use_group)


      const [result_sum_withdraw] = await db.query(`SELECT sum(total)  as sum_withdraw FROM withdraw_money
    WHERE delete_time IS NULL and admin_id	 = ?
    `, [session.branch]);

      const [result_count_use] = await db.query(` SELECT  count(*)  as total
    FROM use_car_wash 
    WHERE   MONTH(create_time) = MONTH(NOW()) and  YEAR(create_time) = YEAR(NOW())
    AND delete_time IS NULL
    and idcar_wash	 = ?
    `, [session.branch]);
      res.render('pages/dashboard', {
        branch: session.branch, data_count_carwash: result,
        result_price: result_price, data_damaged: data_damaged,
        result_dataadmin: result_dataadmin, result_pricemonth: result_pricemonth,
        data_use: data_use, data_accident: data_accident,
        result_sum_withdraw: result_sum_withdraw,
        result_avg_money: result_avg_money,
        result_count_use: result_count_use,
        data_chart_total_money: JSON.stringify(data_chart_total_money),
        result_chart_use_group: JSON.stringify(result_chart_use_group)
      });




    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
});



//login
router.get('/', function (req, res, next) {
  res.render('pages/login');
});
router.get('/logout', sessionChecker, function (req, res, next) {

  delete session.branch;
  delete session.id_admin;
  console.log(session.branch)
  res.redirect('/') // will always fire after session is destroyed

});
//managepromotion

router.get('/managepromotion', sessionChecker, async (req, res, next) => {
  try {
    if (session.branch == 0) {
      const [result] = await db.query(`
      SELECT promotion.*,branch.name_branch, COUNT(*) as total_amount, SUM(promotion.price) as total_price, MAX(promotion.id_promo) as id, MAX(promotion.price) as price_promotion
      FROM promotion
      JOIN type_promotion ON promotion.type = type_promotion.id_type
      LEFT JOIN use_car_wash ON promotion.id_promo = use_car_wash.id_promo
      LEFT JOIN branch ON promotion.branch_id = branch.id_branch
      WHERE promotion.delete_time IS NULL
      GROUP BY promotion.id_promo
      LIMIT 12;
      

       `);

      const [result_total_cus] = await db.query(`SELECT count(*) as total_customer FROM promotion  where delete_time IS NULL`);

      res.render('pages/managepromotion', { admin_name: session.admin_name, branch: session.branch, data_cus: result, total_cus: result_total_cus });

    } else {
      const [result] = await db.query(`SELECT *,count(*) as total_amount,sum(promotion.price) as total_price,promotion.id_promo as id,promotion.price as price_promotion FROM promotion  join type_promotion 
      on promotion.type  = type_promotion.id_type 
      left join  use_car_wash 
      on promotion.id_promo  = use_car_wash.id_promo
      left join  branch 
      on promotion.branch_id  = branch.id_branch
      where promotion.delete_time IS NULL and promotion.branch_id = ? or promotion.branch_id = 0 
      ORDER BY name_branch LIMIT 12 `, [session.branch]);

      const [result_total_cus] = await db.query(`SELECT count(*) as total_customer FROM promotion  where delete_time IS NULL`);

      res.render('pages/managepromotion', { admin_name: session.admin_name, branch: session.branch, data_cus: result, total_cus: result_total_cus });

    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }

});


// show db cus
router.get('/show_cus', sessionChecker, async (req, res, next) => {

  try {
    const [result] = await db.query(`SELECT * FROM customer  where delete_time IS NULL LIMIT 15 `);
    const [result_total_cus] = await db.query(`SELECT count(*) as total_customer FROM customer  where delete_time IS NULL`);
    const [result_avg_money] = await db.query(` SELECT  avg(price)  as avg_total
    FROM use_car_wash 
    WHERE   MONTH(create_time) = MONTH(NOW()) and  YEAR(create_time) = YEAR(NOW())
    AND delete_time IS NULL`);
    const [result_count_use] = await db.query(` SELECT  count(*)  as total
    FROM use_car_wash 
    WHERE   MONTH(create_time) = MONTH(NOW()) and  YEAR(create_time) = YEAR(NOW())
    AND delete_time IS NULL`);
    res.render('pages/show_customer', {
      admin_name: session.admin_name,
      branch: session.branch, data_cus: result,
      total_cus: result_total_cus, result_avg_money: result_avg_money,
      result_count_use: result_count_use
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
});

// show db branch
router.get('/show_branch', sessionChecker, async (req, res, next) => {

  try {
    const [result] = await db.query(`SELECT * FROM branch 
    LEFT JOIN city_branch 
    ON branch.id_branch = city_branch.id_city
    
    where branch.delete_time IS NULL and 
    branch.id_branch  != 0
    and
    city_branch.delete_time IS NULL LIMIT 15 `);
    const [result_city] = await db.query(`SELECT * FROM city_branch 
    where city_branch.delete_time IS NULL LIMIT 15 `);
    const [result_count_branch] = await db.query(`SELECT count(*) as count_branch 
    FROM branch 
    where   branch.id_branch  != 0 and delete_time IS NULL`);
    const [result_sum_withdraw] = await db.query(`SELECT sum(total)  as sum_withdraw FROM withdraw_money
    WHERE delete_time IS NULL `);
    const [result_price] = await db.query(`SELECT sum(price) as total_price 
    FROM use_car_wash  where delete_time IS NULL`);
    const [result_count_city] = await db.query(`SELECT count(*) as count_city
    FROM city_branch 
    where  delete_time IS NULL`);
    res.render('pages/show_branch', {
      admin_name: session.admin_name,
      branch: session.branch, result: result,
      result_count_branch: result_count_branch,
      result_price: result_price, result_sum_withdraw: result_sum_withdraw,
      result_city: result_city, result_count_city: result_count_city
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
});

//show db admin
router.get('/show_admin', sessionChecker, async (req, res) => {
  try {
    const [result_2] = await db.query(`SELECT * FROM admin 
    LEFT join branch on admin.branch_id = branch.id_branch  
    where admin.delete_time  IS NULL  and branch.delete_time  IS NULL    LIMIT 15 `);
    const [result_count_withdraw] = await db.query(`SELECT count(*) as count_withdraw FROM withdraw_money
     WHERE delete_time IS NULL and status = 1  `);
    const [result_sum_withdraw] = await db.query(`SELECT sum(total)  as sum_withdraw FROM withdraw_money
      WHERE delete_time IS NULL and status = 1  `);
    const [result_avg_withdraw] = await db.query(`SELECT avg(total) as avg_withdraw FROM withdraw_money
     WHERE MONTH(create_time) = MONTH(NOW())
     and  YEAR(create_time) = YEAR(NOW()) and  
     delete_time IS NULL  and status = 1   `);
    const [result_price] = await db.query(`SELECT sum(price) as total_price FROM use_car_wash  where delete_time IS NULL`);
    const [count_admin] = await db.query(`SELECT count(*)  as count_total  FROM admin WHERE idadmin != 1`);
    const [result_withdraw] = await db.query(`SELECT * FROM withdraw_money
    LEFT JOIN admin 
    on withdraw_money.admin_id = admin.idadmin
    LEFT join branch on admin.branch_id = branch.id_branch  
    where withdraw_money.delete_time  IS NULL    AND
    admin.delete_time  IS NULL    AND
    branch.delete_time  IS NULL    
    LIMIT 15   `);

    res.render('pages/show_admin', {
      admin_name: session.admin_name,
      branch: session.branch, data_admin: result_2,
      count_admin: count_admin, result_price: result_price,
      result_count_withdraw: result_count_withdraw, result_sum_withdraw: result_sum_withdraw,
      result_avg_withdraw: result_avg_withdraw, result_withdraw: result_withdraw

    });


  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
});


//statistics
router.get('/statistics', sessionChecker, async (req, res) => {
  try {
    if (session.branch == 0) {
      const [result_total_cus] = await db.query(`SELECT count(*) as total_customer FROM promotion  where delete_time IS NULL`);
      const [data_accident] = await db.query(`SELECT count(*) as  accident   
    FROM car_wash WHERE   status != 1 or status_water != 1 or status_wind != 1 or status_foam != 1 `);
      const [data_use] = await db.query(`SELECT count(*) as  usecar   
    FROM car_wash WHERE status = 1 and status_water = 1 and status_wind = 1 and status_foam = 1 `);
      const [data_damaged] = await db.query(`SELECT count(*) as  damaged   
    FROM car_wash WHERE status != 1 or status_water != 1 or status_wind != 1 or status_foam != 1 `);

      res.render('pages/statistics', { admin_name: session.admin_name, branch: session.branch, data_damaged: data_damaged, data_use: data_use, data_accident: data_accident });

    } else {
      const [result_total_cus] = await db.query(`SELECT count(*) as total_customer FROM promotion  where delete_time IS NULL`);
      const [data_accident] = await db.query(`SELECT count(*) as  accident   
    FROM car_wash WHERE branch_id	 = ? and    status != 1 or status_water != 1 or status_wind != 1 or status_foam != 1 `, [session.branch]);
      const [data_use] = await db.query(`SELECT count(*) as  usecar   
    FROM car_wash WHERE branch_id	 = ? and  status = 1 and status_water = 1 and status_wind = 1 and status_foam = 1 `, [session.branch]);
      const [data_damaged] = await db.query(`SELECT count(*) as  damaged   
    FROM car_wash WHERE branch_id	 = ? and  status != 1 or status_water != 1 or status_wind != 1 or status_foam != 1 `, [session.branch]);

      res.render('pages/statistics', { admin_name: session.admin_name, branch: session.branch, data_damaged: data_damaged, data_use: data_use, data_accident: data_accident });

    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
  // res.render('pages/statistics',{branch: session.branch, });
});

//washcarInSystem
router.get('/washcarInSystem', sessionChecker, async (req, res) => {
  try {
    if (session.branch == 0) {
      const [count_carwash] = await db.query(`SELECT count(*) as total_carwash FROM car_wash  where delete_time IS NULL`);

      const [result_carwash] = await db.query(`
      SELECT * FROM car_wash 
      where delete_time IS NULL
      ORDER BY car_wash.status DESC
      LIMIT 4

            `);
      const [result_carwash_branch] = await db.query(`
      SELECT branch.*,COUNT(*) as total 
      FROM branch
      JOIN car_wash on branch.id_branch = car_wash.branch_id
      WHERE id_branch != 0 and branch.delete_time IS NULL and car_wash.delete_time IS NULL
      GROUP by id_branch
            `);


      const [result_total_cus] = await db.query(`SELECT count(*) as total_customer FROM promotion  where delete_time IS NULL`);
      const [data_accident] = await db.query(`SELECT count(*) as  accident   
      FROM car_wash WHERE   status != 1 or status_water != 1 or status_wind != 1 or status_foam != 1 `);
      const [data_use] = await db.query(`SELECT count(*) as  usecar   
      FROM car_wash WHERE status = 1 and status_water = 1 and status_wind = 1 and status_foam = 1  `);
      const [data_damaged] = await db.query(`SELECT count(*) as  damaged   
      FROM car_wash WHERE status != 1 or status_water != 1 or status_wind != 1 or status_foam != 1 `);

      // console.log(result_chart_use)
      const [result_chart_use_group_sql] = await db.query(`
      SELECT branch.id_branch, count(use_car_wash.idcar_wash) as total_group_wash, branch.name_branch as name
FROM use_car_wash
JOIN car_wash on use_car_wash.idcar_wash = car_wash.idcar_wash
JOIN branch on car_wash.branch_id = branch.id_branch
GROUP by branch.id_branch, branch.name_branch;
      `);
      // console.log(result_chart_use)
      let result_chart_use_group = [];
      result_chart_use_group_sql.forEach((value) => {
        let arr_value = [value.name.toString(), parseInt(value.total_group_wash)]
        console.log(arr_value)
        result_chart_use_group.push(arr_value)
      });
      console.log(result_chart_use_group)


      const [result_chart_use_money_day] = await db.query(`
          SELECT avg(price)  as day_total
          FROM use_car_wash 
          WHERE DAY(create_time) = DAY(NOW()) and  MONTH(create_time) = MONTH(NOW()) and  YEAR(create_time) = YEAR(NOW())
          AND delete_time IS NULL
  
      `);
      const [result_chart_use_money_month] = await db.query(`
      SELECT avg(price)  as month_total
      FROM use_car_wash 
      WHERE  MONTH(create_time) = MONTH(NOW()) and  YEAR(create_time) = YEAR(NOW())
      AND delete_time IS NULL
      `);
      const [result_chart_use_money_year] = await db.query(`
        SELECT  avg(price)  as year_total
        FROM use_car_wash 
        WHERE   YEAR(create_time) = YEAR(NOW())
        AND delete_time IS NULL
      `);
      res.render('pages/washcarInSystem', {
        admin_name: session.admin_name,
        branch: session.branch, data_carwash: result_carwash, total_carwash: count_carwash,
        data_damaged: data_damaged, data_use: data_use, data_accident: data_accident,
        result_chart_use_group: JSON.stringify(result_chart_use_group),
        result_carwash_branch: result_carwash_branch,
        result_chart_use_money_day: result_chart_use_money_day,
        result_chart_use_money_month: result_chart_use_money_month,
        result_chart_use_money_year: result_chart_use_money_year
      });



    } else {
      const [count_carwash] = await db.query(`SELECT count(*) as total_carwash FROM car_wash  where delete_time IS NULL and branch_id = ?`, [session.branch]);
      const [result_carwash] = await db.query(`SELECT * FROM car_wash  where delete_time IS NULL and branch_id = ? `, [session.branch]);
      const [result_total_cus] = await db.query(`SELECT count(*) as total_customer FROM promotion  where delete_time IS NULL`);
      const [data_accident] = await db.query(`SELECT count(*) as  accident   
      FROM car_wash WHERE branch_id	 = ? and  status != 1 or status_water != 1 or status_wind != 1 or status_foam != 1 `, [session.branch]);
      const [data_use] = await db.query(`SELECT count(*) as  usecar   
      FROM car_wash WHERE branch_id	 = ? and status = 1 and status_water = 1 and status_wind = 1 and status_foam = 1  `, [session.branch]);
      const [data_damaged] = await db.query(`SELECT count(*) as  damaged   
      FROM car_wash WHERE branch_id	 = ? and status != 1 or status_water != 1 or status_wind != 1 or status_foam != 1 `, [session.branch]);



      const [result_carwash_branch] = await db.query(`
      SELECT branch.*,COUNT(*) as total 
      FROM branch
      JOIN car_wash on branch.id_branch = car_wash.branch_id
      WHERE id_branch != 0 and branch.delete_time IS NULL and car_wash.delete_time IS NULL
      and branch.id_branch = ?
      `, [session.branch]);

      // console.log(result_chart_use)
      const [result_chart_use_group_sql] = await db.query(`
       SELECT use_car_wash.idcar_wash,count(use_car_wash.idcar_wash) as total_group_wash,branch.name_branch as name FROM use_car_wash 
       JOIN car_wash on use_car_wash.idcar_wash = car_wash.idcar_wash
       JOIN branch on car_wash.branch_id = branch.id_branch
       WHERE branch.id_branch = ?
       `, [session.branch]);
      // console.log(result_chart_use)
      let result_chart_use_group = [];
      result_chart_use_group_sql.forEach((value) => {
        let arr_value = [value.name.toString(), parseInt(value.total_group_wash)]
        console.log(arr_value)
        result_chart_use_group.push(arr_value)
      });
      console.log(result_chart_use_group)


      const [result_chart_use_money_day] = await db.query(`
           SELECT avg(price)  as day_total
           FROM use_car_wash 
            LEFT JOIN car_wash ON
           use_car_wash.id_usecar = car_wash.idcar_wash
           WHERE DAY(use_car_wash.create_time) = DAY(NOW()) 
           and  MONTH(use_car_wash.create_time) = MONTH(NOW()) 
           and  YEAR(use_car_wash.create_time) = YEAR(NOW())
           AND use_car_wash.delete_time IS NULL and car_wash.branch_id = ?
           `, [session.branch]);
      const [result_chart_use_money_month] = await db.query(`
       SELECT avg(price)  as month_total
       FROM use_car_wash 
        LEFT JOIN car_wash ON
       use_car_wash.id_usecar = car_wash.idcar_wash
       WHERE  MONTH(use_car_wash.create_time) = MONTH(NOW()) and  YEAR(use_car_wash.create_time) = YEAR(NOW())
       AND use_car_wash.delete_time IS NULL and car_wash.branch_id = ?
       `, [session.branch]);
      const [result_chart_use_money_year] = await db.query(`
       SELECT
       AVG(price) AS year_total
   FROM
       use_car_wash
    LEFT JOIN car_wash ON
       use_car_wash.id_usecar = car_wash.idcar_wash
   WHERE
       YEAR(use_car_wash.create_time) = YEAR(NOW()) AND use_car_wash.delete_time IS NULL and car_wash.branch_id = ?
       `, [session.branch]);


      res.render('pages/washcarInSystem', {
        admin_name: session.admin_name,
        branch: session.branch, data_carwash: result_carwash, total_carwash: count_carwash,
        data_damaged: data_damaged, data_use: data_use, data_accident: data_accident,
        result_chart_use_group: JSON.stringify(result_chart_use_group),
        result_carwash_branch: result_carwash_branch,
        result_chart_use_money_day: result_chart_use_money_day,
        result_chart_use_money_month: result_chart_use_money_month,
        result_chart_use_money_year: result_chart_use_money_year
      });


    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }

});

// ------------------------------------------------







//view_customer
router.get('/view_customer', function (req, res, next) {
  res.render('pages/view_customer');
});



//insert_modal (admin)
router.get('/insert_modal', function (req, res, next) {
  res.render('pages/insert_modal');
});


//insert_customer
router.get('/insert_cus', function (req, res, next) {
  res.render('pages/insert_customer');
});


router.get('/uu', function (req, res, next) {
  res.render('uu/index');
});




module.exports = router;