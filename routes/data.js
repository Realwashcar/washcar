
// const express = require('express') //install express: Terminal (ประกาศใช้งาน express)
// const app = express() //เก็บตัว object ไว้ใน ตัวแปร app

// const router = express.Router
var express = require('express');
var router = express.Router();
const session = require('express-session');
const mysql = require('mysql2/promise');
// const mysql = require('mysql');
const admin = require('firebase-admin');
const serviceAccount = require('./projectjop-86653-firebase-adminsdk-riay7-b1a0545395.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://projectjop-86653-default-rtdb.asia-southeast1.firebasedatabase.app'
});

const fs = require('fs');
const path = require('path');
const db_fb = admin.database();
//  ssl: { ca: fs.readFileSync(path.join(__dirname, 'cert', 'DigiCertGlobalRootCA.crt.pem')) }
const db = mysql.createPool({
  host: 'projectmysql.mysql.database.azure.com',
  user: 'apipathadmin',
  password: '0988709784k+',
  database: 'projectp_success',
  port: '3306',
});

router.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});
router.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false
}));

const sessionChecker = (req, res, next) => {

  if (session.id_admin !== undefined) {
    // หากมีค่าตัวแปร session ชื่อ user ให้เรียกฟังก์ชั่น next()
    next();
  } else {
    // หากไม่มีค่าตัวแปร session ให้ render EJS ชื่อ login
    res.render('pages/login');
  }
};



router.post('/alladmin', async (req, res) => {
  try {
    const uid = req.body.id;
    const [result] = await db.query(`SELECT * FROM admin`);

    // const iterableResult = Object.values(result); // แปลงเป็น iterable array

    res.status(200).json({ 'success': true, 'data': result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
});
//check_login
router.post('/check_admin', async (req, res) => {
  let us = req.body.username
  let pss = req.body.password
  console.log(us)
  console.log(pss)
  try {
    const uid = req.body.id;
    const [result] = await db.query(`SELECT * FROM admin where  username = ? and password = ? and delete_time IS NULL`, [us, pss]);
    console.log(result)
    if (result.length != 0) {
      session.id_admin = result[0].idadmin;
      session.branch = result[0].branch_id;
      session.admin_name = result[0].admin_name;
      console.log(session.id_admin)
      console.log(session.branch)
      console.log(session.admin_name)
      res.status(200).json({ 'success': result.length, 'data': result, name: session.name, branch: session.branch })
    } else {
      res.status(200).json({ 'success': result.length })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
});

router.post('/edit_datacustomer', sessionChecker, async (req, res) => {
  try {
    const uid = req.body.id;
    const [result] = await db.query("UPDATE `customer` SET ? where username = ?", [req.body, req.body.username]);
    console.log(result.affectedRows)
    if (result.affectedRows != 0) {
      res.status(200).json({ 'status': 'success', 'data': result })
    } else {
      res.status(200).json({ 'status': 'error' })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
  // console.log(req.body)
  // db.query("UPDATE `customer` SET ? where username = ?", [req.body, req.body.username], function (err, result, fields) {
  //   if (err) throw err;
  //   console.log(result.affectedRows)
  //   if (result.affectedRows != 0) {
  //     res.status(200).json({ 'status': 'success', 'data': result })
  //   } else {
  //     res.status(200).json({ 'status': 'error' })
  //   }
  //   // res.status(200).json({ 'success': result})
  // });
});


router.post('/delete_datacustomer', sessionChecker, async (req, res) => {

  try {
    const uid = req.body.id;
    const [result] = await db.query("UPDATE `customer` SET delete_time = NOW() where username = ?", [req.body.username]);

    // const iterableResult = Object.values(result); // แปลงเป็น iterable array

    console.log(result.affectedRows)
    if (result.affectedRows != 0) {
      res.status(200).json({ 'status': 'success', 'data': result })
    } else {
      res.status(200).json({ 'status': 'error' })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }

});

//allcustomer
router.get('/allcustomer', sessionChecker, async (req, res) => {

  try {
    const uid = req.body.id;
    const [result] = await db.query(`SELECT * FROM customer `);

    // const iterableResult = Object.values(result); // แปลงเป็น iterable array

    res.status(200).json({ 'success': true, 'data': result })
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
});

//viewcustomer
// router.post('/viewcustomer', sessionChecker, (req, res) => {
//   let uid = req.body.id
//   db.query(`SELECT *,sum(price) as total_use,customer.point  as balance_point FROM customer  
//   left join use_car_wash on customer.username = use_car_wash.email_cus where username = ?`, [uid], function (err, result, fields) {
//     if (err) throw err;
//     res.status(200).json({ 'success': true, 'data': result })
//   });
// });

// router.post('/viewcustomer', async (req, res) => {
//   try {
//     let uid = req.body.id
//     const [result] = await db.query(`SELECT *,sum(price) as total_use,customer.point  as balance_point FROM customer  
//     left join use_car_wash on customer.username = use_car_wash.email_cus where username = ?`, [uid]);
//     console.log(result)


//     res.status(200).json({ 'success': true, 'data': result })
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ 'success': false, 'message': 'Internal server error' });
//   }
// });

router.post('/viewcustomer', sessionChecker, async (req, res) => {
  try {
    const uid = req.body.id;
    console.log(uid)
    const [result] = await db.query(`SELECT *, sum(price) as total_use, customer.point as balance_point FROM customer  
    LEFT JOIN use_car_wash ON customer.username = use_car_wash.email_cus WHERE username = ?`, [uid]);

    // const iterableResult = Object.values(result); // แปลงเป็น iterable array

    res.status(200).json({ 'success': false, 'data': result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
});



router.post('/viewadmin', sessionChecker, async (req, res) => {
  try {
    const addid = req.body.id;
    const [result] = await db.query(`SELECT * FROM admin 
        LEFT join branch on admin.branch_id = branch.id_branch 
        LEFT join city_branch on branch.city_id = city_branch.id_city 
        where idadmin =  ?`, [addid]);
    console.log(result)
    const [result_branch] = await db.query(`SELECT * FROM branch where delete_time IS NULL `);

    const [result_city_branch] = await db.query(`SELECT * FROM city_branch  where delete_time IS NULL`);

    res.status(200).json({ 'success': true, data: result, all_branch: result_branch, city_branch: result_city_branch })
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
});


router.post('/edit_dataadmin', sessionChecker, async (req, res) => {
  try {
    const uid = req.body.id;
    const u_name = req.body.username;
    const name = req.body.admin_name;
    console.log(uid + "   " + u_name + "   " + name)
    const [count_branch] = await db.query(`SELECT count(*) as c_b FROM branch where delete_time IS NULL  and id_branch = ?`, [req.body.branch]);
    const [count_city_branch] = await db.query(`SELECT count(*) as c_cb FROM city_branch  where delete_time IS NULL and id_city = ?`, [req.body.city]);
    console.log(count_branch[0].c_b)
    if (count_branch[0].c_b == 0 || count_city_branch[0].c_cb == 0) {
      if (count_branch[0].c_b == 0) {
        res.status(200).json({ 'status': 'error', message: 'ไม่พบข้อมูลสาขา' })
      } else {
        res.status(200).json({ 'status': 'error', message: 'ไม่พบข้อมูลจังหวัด' })
      }

    } else {
      const [result] = await db.query(`UPDATE admin SET 
    admin_name = ?,
    username = ?,
    password = ?,
    branch_id = ?,
    admin_tel = ?
     WHERE  idadmin = ?`,
        [req.body.admin_name,
        req.body.username,
        req.body.password,
        req.body.branch,
        req.body.tel,
        req.body.id]);
      console.log(result.affectedRows)
      const [result_branch] = await db.query(`UPDATE branch SET
     city_id=?
      WHERE id_branch = ?`,
        [req.body.city,
        req.body.branch]);
      console.log(result.affectedRows)
      if (result.affectedRows != 0) {
        res.status(200).json({ 'status': 'success', 'data': result })
      } else {
        res.status(200).json({ 'status': 'error' })
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
});

router.post('/viewadmin_withdraw', sessionChecker, async (req, res) => {
  try {
    const addid = req.body.id;
    const [result] = await db.query(`SELECT withdraw_money.*,admin.username 
    FROM withdraw_money
    LEFT JOIN  admin ON withdraw_money.admin_id = admin.idadmin
    WHERE id = ?`, [addid]);
    console.log(result)
    const [result_branch] = await db.query(`SELECT * FROM branch where delete_time IS NULL `);

    const [result_city_branch] = await db.query(`SELECT * FROM city_branch  where delete_time IS NULL`);

    res.status(200).json({ 'success': true, data: result, all_branch: result_branch, city_branch: result_city_branch })
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
});
router.post('/edit_dataadmin_withdraw', sessionChecker, async (req, res) => {
  try {
    const [result] = await db.query(`UPDATE withdraw_money SET total=?,
      status=? WHERE id = ?`,
      [req.body.money,
      req.body.status,
      req.body.uid]);
    console.log(result.affectedRows)
    if (result.affectedRows != 0) {
      res.status(200).json({ 'status': 'success', 'data': result })
    } else {
      res.status(200).json({ 'status': 'error' })
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
});

router.post('/delete_data_admin_withdraw', sessionChecker, async (req, res) => {
  try {
    console.log(req.body.id)
    const [result] = await db.query("UPDATE `withdraw_money` SET delete_time = NOW() where id = ?", [req.body.id]);

    // const iterableResult = Object.values(result); // แปลงเป็น iterable array

    console.log(result.affectedRows)
    if (result.affectedRows != 0) {
      res.status(200).json({ 'status': 'success', 'data': result })
    } else {
      res.status(200).json({ 'status': 'error' })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }

});


router.post('/delete_data_admin', sessionChecker, async (req, res) => {
  try {
    console.log(req.body.id)
    const [result] = await db.query("UPDATE `admin` SET delete_time = NOW() where idadmin = ?", [req.body.id]);

    // const iterableResult = Object.values(result); // แปลงเป็น iterable array

    console.log(result.affectedRows)
    if (result.affectedRows != 0) {
      res.status(200).json({ 'status': 'success', 'data': result })
    } else {
      res.status(200).json({ 'status': 'error' })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }

});

//viewadmin
// router.post('/viewadmin', async (req, res) => {
//   let addid = req.body.id
//   db.query(`SELECT * FROM admin 
//   LEFT join branch on admin.branch_id = branch.id_branch 
//   LEFT join city_branch on branch.city_id = city_branch.id_city 
//   where idadmin =  ?`, [addid], function  (err, result, fields) {
//     if (err) throw err;
//     db.query(`SELECT * FROM branch `, function await  (err, result_branch, fields) {
//       if (err) throw err;
//       db.query(`SELECT * FROM city_branch `, function  await  (err, result_city_branch, fields) {
//         if (err) throw err;
//         res.status(200).json({ 'success': true, 'data': result ,all_branch :result_branch,city_branch:result_city_branch})
//       });
//     });

//   });
// });

//insert_admin
router.post('/insert_admin', (req, res) => {
  // let name = req.body.name
  // let email = req.body.email
  // let password = req.body.password
  // let branch = req.body.branch
  // let tel = req.body.tel
  // console.log(name);
  // db.query("INSERT INTO `admin`( `name`, `username`, `password`, `branch`, `tel`) VALUES (?,?,?,?,?)", [name, email, password, branch, tel], function (err, result, fields) {
  //   if (err) throw err;
  //   res.send(result)
  // });
});


router.post('/choose_month_data_dashboard', async (req, res) => {
  await db.execute('SET @total := 0');
  const [result_chart_use] = await db.query(`
    SELECT DAY(create_time) as time, sum(price)  as running_total
     FROM use_car_wash WHERE MONTH(create_time) = MONTH(NOW()) and  
     YEAR(create_time) = YEAR(NOW()) and delete_time IS NULL
     GROUP BY time
     `);
  // console.log(result_chart_use)
  let data_chart_total_money = [];
  result_chart_use.forEach((value) => {
    let arr_value = ["วันที่ " + (value.time).toString(), parseInt(value.running_total)]
    console.log(arr_value)
    data_chart_total_money.push(arr_value)
  });
  console.log(data_chart_total_money)

  res.status(200).json({ 'success': true, 'data_chart_total_money': data_chart_total_money })
});
//insert_cus

router.post('/choose_day_data_dashboard', async (req, res) => {
  await db.execute('SET @total := 0');
  const [result_chart_use] = await db.query(`
    SELECT HOUR(create_time) as time, sum(price)  as running_total
     FROM use_car_wash WHERE DAY(create_time) = DAY(NOW()) and 
     MONTH(create_time) = MONTH(NOW()) and  YEAR(create_time) = YEAR(NOW())
      and delete_time IS NULL
      GROUP BY time
      `);
  // console.log(result_chart_use)
  let data_chart_total_money = [];
  result_chart_use.forEach((value) => {
    let txt_time = "";
    if ((value.time).toString().length == 1) {
      txt_time = 0 + (value.time).toString()
    } else {
      txt_time = (value.time).toString()
    }
    let arr_value = [txt_time, parseInt(value.running_total)]
    console.log(arr_value)
    data_chart_total_money.push(arr_value)
  });
  console.log(data_chart_total_money)

  res.status(200).json({ 'success': true, 'data_chart_total_money': data_chart_total_money })
});
router.post('/choose_year_data_dashboard', async (req, res) => {
  await db.execute('SET @total := 0');
  const [result_chart_use] = await db.query(`
    SELECT MONTH(create_time) as time, sum(price)  as running_total
    FROM use_car_wash WHERE 
      YEAR(create_time) = YEAR(NOW())
      and delete_time IS NULL
      GROUP BY time
      `);
  // console.log(result_chart_use)
  let data_chart_total_money = [];
  result_chart_use.forEach((value) => {
    let arr_value = ["เดือนที่ " + (value.time).toString(), parseInt(value.running_total)]
    console.log(arr_value)
    data_chart_total_money.push(arr_value)
  });
  console.log(data_chart_total_money)

  res.status(200).json({ 'success': true, 'data_chart_total_money': data_chart_total_money })
});
//insert_cus




router.post('/insert_cus', (req, res) => {

  db_fb.ref('working_state').set(0)
  // let name = req.body.name
  // let email = req.body.email
  // let password = req.body.password
  // let tel = req.body.tel
  // console.log(name);
  // db.query("INSERT INTO `customer`( `name`, `username`, `password`,`tel`) VALUES (?,?,?,?)", [name, email, password, tel], function (err, result, fields) {
  //   if (err) throw err;
  //   res.send(result)
  // });
});





// insert city
router.post('/insert_city', async (req, res) => {
  try {
    console.log(req.body.name_city)
    const [result] = await db.query(`select * from city_branch
    where name_city = ?`,
      [req.body.name_city]);

    // const iterableResult = Object.values(result); // แปลงเป็น iterable array

    console.log(result.length)
    if (result.length != 0) {
      res.status(200).json({ 'status': 'error' })
    } else {
      const [result_add_city] = await db.query(`INSERT INTO city_branch(name_city) 
      VALUES (?)`,
        [req.body.name_city]);
      res.status(200).json({ 'status': 'success' })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
});

router.post('/viewcity', sessionChecker, async (req, res) => {
  console.log(req.body.id_city);
  try {
    const [result] = await db.query(`select * from city_branch
    where id_city = ?`, [req.body.id_city]);

    // const iterableResult = Object.values(result); // แปลงเป็น iterable array

    res.status(200).json({ status: 'success', 'data': result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
});

router.post('/update_city', sessionChecker, async (req, res) => {

  try {
    console.log(req.body.name_city)
    const [result] = await db.query(`select * from city_branch
    where name_city = ?`,
      [req.body.name_city]);

    // const iterableResult = Object.values(result); // แปลงเป็น iterable array

    console.log(result.length)
    if (result.length != 0) {
      res.status(200).json({ 'status': 'error' })
    } else {
      const [result] = await db.query("UPDATE city_branch SET name_city = ? where id_city  = ?", [req.body.name_city, req.body.id_city]);

      // const iterableResult = Object.values(result); // แปลงเป็น iterable array

      console.log(result.affectedRows)
      if (result.affectedRows != 0) {
        res.status(200).json({ 'status': 'success', 'data': result })
      } else {
        res.status(200).json({ 'status': 'error' })
      }
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }

});
router.post('/delete_city', sessionChecker, async (req, res) => {

  try {
    const [result] = await db.query("UPDATE city_branch SET delete_time = NOW() where id_city  = ?", [req.body.id_city]);

    // const iterableResult = Object.values(result); // แปลงเป็น iterable array

    console.log(result.affectedRows)
    if (result.affectedRows != 0) {
      res.status(200).json({ 'status': 'success', 'data': result })
    } else {
      res.status(200).json({ 'status': 'error' })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }

});





// insert branch
router.post('/insert_branch', async (req, res) => {
  try {
    console.log(req.body.name_city)
    const [result] = await db.query(`select * from branch
    where name_branch = ?`,
      [req.body.name_city]);

    // const iterableResult = Object.values(result); // แปลงเป็น iterable array

    console.log(result.length)
    if (result.length != 0) {
      res.status(200).json({ 'status': 'error' })
    } else {
      const [result_add_city] = await db.query(`INSERT INTO branch(name_branch) 
      VALUES (?)`,
        [req.body.name_city]);
      res.status(200).json({ 'status': 'success' })
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
});

router.post('/viewallcity', sessionChecker, async (req, res) => {
  console.log(req.body.id_city);
  try {
    const [result] = await db.query(`select * from city_branch
    where id_city = ?`, [req.body.id_city]);

    // const iterableResult = Object.values(result); // แปลงเป็น iterable array

    res.status(200).json({ status: 'success', 'data': result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 'success': false, 'message': 'Internal server error' });
  }
});

router.post('/updatecustomer', (req, res) => {
  let id = req.body.id
  console.log(id)
  res.status(200).json({ 'success': true, 'result': id })
});




module.exports = router;