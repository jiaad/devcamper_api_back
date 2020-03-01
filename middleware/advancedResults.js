const advancedResults = (model, populate) => async(req, res, next) => {

    let returnQuery;

    // copy request.query
    requestQuery = { ...req.query }
    console.log('type of rew query', typeof requestQuery)
    // Field to exclude
  
    const removeFields = ['select', 'sort', 'page', 'limit', 'skip']
  
    // Loop over removeFields and delete them from reqQuery
  
    removeFields.forEach(param => delete requestQuery[param]);
  
    // Create query String
    let queryStr = JSON.stringify(requestQuery);
  
    // Create operators like ($gt, $gte etc..)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)// pour matcher les requete HTTP
  
    // Finding resources
    returnQuery = model.find(JSON.parse(queryStr))
  
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ')
      returnQuery = returnQuery.select(fields)
    }
  
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      returnQuery = returnQuery.sort(sortBy)
    } else {
      returnQuery = returnQuery.sort('-createdAt')
    }
    // query.sort({ averageCost: 1 })
  
    // Pagination
  
    let page = parseInt(req.query.page, 10) || 1
    let limit = parseInt(req.query.limit, 10) || 25
    let startIndex = (page - 1) * limit
    let endIndex = page * limit
    const total = await model.countDocuments();
    console.log('skip : ', total)
    returnQuery = returnQuery.skip(startIndex).limit(limit)

        if(populate){
            returnQuery = returnQuery.populate(populate)
        }

    // Executing Query
    let results = await returnQuery
    // console.log(req.query);
    // console.log(typeof req.query);
  
    // Pagination result
    let pagination = {}
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit: limit
      }
    }
  
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit: limit
      }
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination: pagination,
        data: results
    }
    next()
}

module.exports = advancedResults